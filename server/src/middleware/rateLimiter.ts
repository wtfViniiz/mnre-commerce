import { Request, Response, NextFunction } from 'express'

interface RateLimitInfo {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitInfo>()

const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutos
const MAX_REQUESTS_PER_WINDOW = 100 // 100 requisições por janela

function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  )
}

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Pular rate limiting para rotas admin (administradores precisam de mais requisições)
  if (req.path.startsWith('/api/admin')) {
    return next()
  }

  const ip = getClientIP(req)
  const now = Date.now()

  const limitInfo = rateLimitStore.get(ip)

  if (!limitInfo || now > limitInfo.resetTime) {
    // Nova janela ou janela expirada
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    })
    return next()
  }

  if (limitInfo.count >= MAX_REQUESTS_PER_WINDOW) {
    // Limite excedido
    res.status(429).json({
      error: 'Muitas requisições. Tente novamente mais tarde.',
      retryAfter: Math.ceil((limitInfo.resetTime - now) / 1000),
    })
    return
  }

  // Incrementar contador
  limitInfo.count++
  rateLimitStore.set(ip, limitInfo)
  next()
}

// Limpar entradas expiradas periodicamente (a cada 5 minutos)
setInterval(() => {
  const now = Date.now()
  for (const [ip, info] of rateLimitStore.entries()) {
    if (now > info.resetTime) {
      rateLimitStore.delete(ip)
    }
  }
}, 5 * 60 * 1000)

