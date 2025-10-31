import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${SECRET}-refresh`

// Garantir que o secret seja forte
if (SECRET === 'your-secret-key-change-in-production') {
  console.warn('⚠️  AVISO: Usando JWT_SECRET padrão. ALTERE EM PRODUÇÃO!')
}

interface TokenPayload {
  userId: string
  type?: 'access' | 'refresh'
}

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'access' },
    SECRET,
    { expiresIn: '15m' } // Token de acesso curto (15 minutos)
  )
}

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: '7d' } // Refresh token mais longo (7 dias)
  )
}

export const verifyToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, SECRET) as TokenPayload
    if (decoded.type !== 'access') {
      throw new Error('Tipo de token inválido')
    }
    return { userId: decoded.userId }
  } catch (error) {
    throw new Error('Token inválido ou expirado')
  }
}

export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as TokenPayload
    if (decoded.type !== 'refresh') {
      throw new Error('Tipo de token inválido')
    }
    return { userId: decoded.userId }
  } catch (error) {
    throw new Error('Refresh token inválido ou expirado')
  }
}

// Gerar nonce para CSRF protection
export const generateNonce = (): string => {
  return crypto.randomBytes(32).toString('hex')
}
