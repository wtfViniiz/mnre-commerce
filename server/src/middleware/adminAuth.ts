import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from './auth'

const prisma = new PrismaClient()

export interface AdminRequest extends AuthRequest {
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
}

export const adminAuth = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Primeiro verificar autenticação básica
    await new Promise<void>((resolve, reject) => {
      authenticate(req, res, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    // Verificar se o usuário existe e é admin
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar este recurso.' })
    }

    req.user = user
    next()
  } catch (error: any) {
    return res.status(401).json({ error: error.message || 'Erro na autenticação' })
  }
}

