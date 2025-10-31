import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import crypto from 'crypto'

// Estado simples para CSRF tokens (em produção, usar Redis ou similar)
const csrfTokens = new Map<string, { token: string; expiresAt: number }>()

// Limpar tokens expirados periodicamente
setInterval(() => {
  const now = Date.now()
  for (const [userId, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(userId)
    }
  }
}, 60 * 60 * 1000) // A cada hora

// Gerar CSRF token para usuário autenticado
export const generateCSRFToken = (userId: string): string => {
  const token = crypto.randomBytes(32).toString('hex')
  csrfTokens.set(userId, {
    token,
    expiresAt: Date.now() + 3600000, // 1 hora
  })
  return token
}

// Validar CSRF token
export const validateCSRF = (req: Request, res: Response, next: NextFunction) => {
  // Apenas validar para métodos que modificam dados
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next()
  }

  // Extrair userId do token JWT
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Não autenticado' })
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const { userId } = verifyToken(token)

    // Buscar CSRF token do header
    const csrfToken = req.headers['x-csrf-token'] as string
    if (!csrfToken) {
      return res.status(403).json({ error: 'CSRF token não fornecido' })
    }

    // Verificar se o token existe e é válido
    const stored = csrfTokens.get(userId)
    if (!stored || stored.token !== csrfToken) {
      return res.status(403).json({ error: 'CSRF token inválido' })
    }

    // Verificar se não expirou
    if (Date.now() > stored.expiresAt) {
      csrfTokens.delete(userId)
      return res.status(403).json({ error: 'CSRF token expirado' })
    }

    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

