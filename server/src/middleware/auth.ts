import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, secret) as { userId: string }

    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

