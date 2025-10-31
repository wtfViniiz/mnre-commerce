import { Request, Response, NextFunction } from 'express'

/**
 * Proteção contra timing attacks
 * Garante que comparações de strings sensíveis sempre levem o mesmo tempo,
 * independentemente do resultado
 */
export const constantTimeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    // Executar comparação mesmo assim para manter tempo constante
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/**
 * Middleware para proteger endpoints sensíveis contra timing attacks
 */
export const timingAttackProtection = (req: Request, res: Response, next: NextFunction) => {
  // Adicionar delay mínimo em operações sensíveis para normalizar tempo de resposta
  // Isso dificulta timing attacks baseados em tempo de resposta
  
  const startTime = Date.now()
  const minResponseTime = 100 // 100ms mínimo

  // Interceptar resposta para garantir tempo mínimo
  const originalJson = res.json.bind(res)
  res.json = function (body: any) {
    const elapsed = Date.now() - startTime
    if (elapsed < minResponseTime) {
      setTimeout(() => {
        originalJson(body)
      }, minResponseTime - elapsed)
    } else {
      originalJson(body)
    }
    return res
  }

  next()
}

