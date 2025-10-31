import { Request, Response, NextFunction } from 'express'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message?: string
}

interface EndpointLimit {
  count: number
  resetTime: number
}

// Configurações específicas por endpoint
const endpointConfigs: Map<string, RateLimitConfig> = new Map([
  ['/api/auth/login', { windowMs: 15 * 60 * 1000, maxRequests: 5, message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }],
  ['/api/auth/register', { windowMs: 60 * 60 * 1000, maxRequests: 3, message: 'Muitas tentativas de registro. Tente novamente em 1 hora.' }],
  ['/api/payment/preference', { windowMs: 60 * 1000, maxRequests: 10, message: 'Muitas requisições de pagamento. Aguarde um momento.' }],
  ['/api/cart', { windowMs: 60 * 1000, maxRequests: 30, message: 'Muitas requisições ao carrinho. Aguarde um momento.' }],
])

const endpointLimits = new Map<string, Map<string, EndpointLimit>>()

function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  )
}

// Limpar limites expirados periodicamente
setInterval(() => {
  const now = Date.now()
  for (const [endpoint, ipMap] of endpointLimits.entries()) {
    for (const [ip, limit] of ipMap.entries()) {
      if (now > limit.resetTime) {
        ipMap.delete(ip)
      }
    }
    if (ipMap.size === 0) {
      endpointLimits.delete(endpoint)
    }
  }
}, 5 * 60 * 1000) // A cada 5 minutos

export const endpointRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const path = req.path
  const config = endpointConfigs.get(path)

  // Se não há configuração específica para este endpoint, pular
  if (!config) {
    return next()
  }

  const ip = getClientIP(req)
  const now = Date.now()

  // Obter ou criar mapa de IPs para este endpoint
  let ipMap = endpointLimits.get(path)
  if (!ipMap) {
    ipMap = new Map()
    endpointLimits.set(path, ipMap)
  }

  const limit = ipMap.get(ip)

  // Nova janela ou janela expirada
  if (!limit || now > limit.resetTime) {
    ipMap.set(ip, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return next()
  }

  // Verificar se excedeu o limite
  if (limit.count >= config.maxRequests) {
    const retryAfter = Math.ceil((limit.resetTime - now) / 1000)
    return res.status(429).json({
      error: config.message || 'Muitas requisições. Tente novamente mais tarde.',
      retryAfter,
    })
  }

  // Incrementar contador
  limit.count++
  ipMap.set(ip, limit)

  // Adicionar headers informativos
  res.setHeader('X-RateLimit-Limit', config.maxRequests.toString())
  res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - limit.count).toString())
  res.setHeader('X-RateLimit-Reset', new Date(limit.resetTime).toISOString())

  next()
}

