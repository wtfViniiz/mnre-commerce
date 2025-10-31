import { Request, Response, NextFunction } from 'express'

/**
 * Middleware para forçar HTTPS em produção
 * Redireciona requisições HTTP para HTTPS
 */
export const httpsEnforcement = (req: Request, res: Response, next: NextFunction) => {
  // Apenas em produção
  if (process.env.NODE_ENV !== 'production') {
    return next()
  }

  // Verificar se a requisição já é HTTPS
  const protocol = req.headers['x-forwarded-proto'] || req.protocol
  
  if (protocol !== 'https') {
    // Redirecionar para HTTPS
    const host = req.get('host')
    const url = req.originalUrl || req.url
    return res.redirect(301, `https://${host}${url}`)
  }

  // Header HSTS já está configurado no securityHeaders
  next()
}

/**
 * Configurar cookies seguros
 */
export const secureCookieOptions = {
  httpOnly: true, // Não acessível via JavaScript
  secure: process.env.NODE_ENV === 'production', // Apenas HTTPS em produção
  sameSite: 'strict' as const, // Proteção CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  path: '/',
}

/**
 * Helper para criar cookies seguros
 */
export const createSecureCookie = (name: string, value: string, res: Response) => {
  res.cookie(name, value, secureCookieOptions)
}

/**
 * Helper para limpar cookies seguros
 */
export const clearSecureCookie = (name: string, res: Response) => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  })
}

