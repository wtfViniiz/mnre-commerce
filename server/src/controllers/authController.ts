import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { recordFailedLogin, resetFailedLoginAttempts } from '../middleware/securityDetector'
import { logger } from '../services/logger'

const prisma = new PrismaClient()

function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  )
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    // Validação de força de senha
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'Senha deve ter no mínimo 8 caracteres, incluindo: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial',
      })
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' })
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // Não revelar que o email existe (prevenir enumeração)
      return res.status(400).json({ error: 'Erro ao criar conta. Verifique seus dados.' })
    }

    // Hash da senha com salt rounds aumentado (mais seguro, mas mais lento)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        cpf: true,
        phone: true,
        birthDate: true,
        profileCompleted: true,
        createdAt: true,
      },
    })

    // Gerar tokens
    const accessToken = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Log de auditoria
    const ip = getClientIP(req)
    await logger.info(`Novo usuário registrado`, {
      ip,
      endpoint: '/auth/register',
      method: 'POST',
      userId: user.id,
      details: { email },
    })

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'USER',
        cpf: user.cpf,
        phone: user.phone,
        birthDate: user.birthDate,
        profileCompleted: user.profileCompleted || false,
        createdAt: user.createdAt,
      },
      token: accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error('Erro no registro:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const getMe = async (req: any, res: Response) => {
  try {
    // O middleware authenticate já valida o token e adiciona userId no request
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Token não fornecido ou inválido' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        cpf: true,
        phone: true,
        birthDate: true,
        profileCompleted: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    res.json({ user })
  } catch (error: any) {
    console.error('Erro ao buscar usuário:', error)
    res.status(500).json({ error: 'Erro ao buscar usuário' })
  }
}

export const updateProfile = async (req: any, res: Response) => {
  try {
    // O middleware authenticate já valida o token e adiciona userId no request
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ error: 'Token não fornecido ou inválido' })
    }

    const { name, email, cpf, phone, birthDate } = req.body

    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' })
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' })
    }

    // Verificar se email já existe em outro usuário
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId },
      },
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso' })
    }

    // Preparar dados de atualização
    const updateData: any = {
      name,
      email,
    }

    // Adicionar campos opcionais se fornecidos
    if (cpf !== undefined) {
      // Validar e limpar CPF
      const cpfNumbers = cpf.replace(/\D/g, '')
      if (cpfNumbers.length === 11) {
        updateData.cpf = cpfNumbers
      }
    }

    if (phone !== undefined) {
      // Limpar telefone
      updateData.phone = phone.replace(/\D/g, '')
    }

    if (birthDate !== undefined) {
      updateData.birthDate = birthDate
    }

    // Se todos os campos foram fornecidos, marcar perfil como completo
    if (cpf && phone && birthDate) {
      updateData.profileCompleted = true
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        cpf: true,
        phone: true,
        birthDate: true,
        profileCompleted: true,
        createdAt: true,
      },
    })

    // Log de auditoria
    const ip = getClientIP(req)
    await logger.audit({
      userId: userId,
      action: 'UPDATE',
      entityType: 'USER',
      entityId: userId,
      description: `Perfil atualizado`,
      ip,
      userAgent: req.headers['user-agent'],
    })

    res.json({ user })
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error)
    res.status(500).json({ error: 'Erro ao atualizar perfil' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      const ip = getClientIP(req)
      recordFailedLogin(ip)
      await logger.warning(`Tentativa de login falha: email não encontrado`, {
        ip,
        endpoint: '/auth/login',
        method: 'POST',
        details: { email },
      })
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    // Verificar senha com proteção contra timing attacks
    // Sempre executar a comparação, mesmo se usuário não existir (usando hash dummy)
    const dummyHash = '$2a$12$dummyhashfordummycomparison1234567890123456789012'
    const userHash = user.password
    const isValidPassword = await bcrypt.compare(password, userHash || dummyHash)

    if (!isValidPassword || !userHash) {
      const ip = getClientIP(req)
      recordFailedLogin(ip)
      await logger.warning(`Tentativa de login falha: senha incorreta`, {
        ip,
        endpoint: '/auth/login',
        method: 'POST',
        userId: user.id,
        details: { email },
      })
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    // Login bem-sucedido - resetar tentativas
    const ip = getClientIP(req)
    resetFailedLoginAttempts(ip)

    // Log de login bem-sucedido
    await logger.info(`Login bem-sucedido`, {
      ip,
      endpoint: '/auth/login',
      method: 'POST',
      userId: user.id,
      details: { email },
    })

    // Gerar tokens
    const accessToken = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        cpf: user.cpf,
        phone: user.phone,
        birthDate: user.birthDate,
        profileCompleted: user.profileCompleted,
        createdAt: user.createdAt,
      },
      token: accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Refresh token não fornecido' })
    }

    try {
      const { userId } = verifyRefreshToken(token)

      // Verificar se usuário ainda existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      })

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' })
      }

      // Gerar novos tokens
      const newAccessToken = generateToken(user.id)
      const newRefreshToken = generateRefreshToken(user.id)

      res.json({
        token: newAccessToken,
        refreshToken: newRefreshToken,
      })
    } catch (error) {
      return res.status(401).json({ error: 'Refresh token inválido ou expirado' })
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
