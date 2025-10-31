import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { logger } from '../services/logger'

const prisma = new PrismaClient()

// Padrões de SQL Injection
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
  /(\bOR\s+['"]?\d+['"]?\s*=\s*['"]?\d+)/i,
  /('|("|;|\\)(;|\\)|--|\*|')/i,
  /(\b(SELECT|INSERT).*FROM.*WHERE)/i,
  /(\b(DROP|DELETE).*(TABLE|DATABASE))/i,
  /(\/\*|\*\/|--|\#)/,
  /(xp_|sp_|cmdshell)/i,
]

// Padrões de XSS
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<img[^>]*src\s*=\s*["']?javascript:/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
]

// IPs bloqueados (pode ser expandido com banco de dados)
const blockedIPs = new Map<string, { blocked: boolean; attempts: number; lastAttempt: Date }>()

// Rastreamento de tentativas de login falhas por IP
const failedLoginAttempts = new Map<string, { count: number; lastAttempt: Date }>()

function detectSQLInjection(input: string): boolean {
  if (!input) return false
  const str = String(input).toLowerCase()
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(str))
}

function detectXSS(input: string): boolean {
  if (!input) return false
  const str = String(input)
  return XSS_PATTERNS.some((pattern) => pattern.test(str))
}

function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  )
}

async function saveSecurityEvent(
  eventType: string,
  severity: string,
  req: Request,
  description: string,
  blocked: boolean = false
) {
  try {
    const ip = getClientIP(req)
    const payload = {
      query: req.query,
      body: req.body,
      params: req.params,
    }

    await prisma.securityEvent.create({
      data: {
        eventType,
        severity,
        ip,
        userAgent: req.headers['user-agent'] || null,
        endpoint: req.path,
        method: req.method,
        payload: JSON.stringify(payload),
        blocked,
        description,
      },
    })
  } catch (error) {
    console.error('Erro ao salvar evento de segurança:', error)
  }
}

export const securityDetector = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = getClientIP(req)

  // Verificar se o IP está bloqueado
  const blocked = blockedIPs.get(ip)
  if (blocked?.blocked) {
    await logger.securityAlert(`Requisição bloqueada de IP bloqueado: ${ip}`, {
      ip,
      endpoint: req.path,
      method: req.method,
      details: { reason: 'IP bloqueado' },
    })
    return res.status(403).json({ error: 'Acesso negado' })
  }

  // Verificar SQL Injection em query params, body e params
  const checkInput = (obj: any, source: string): { found: boolean; type?: string } => {
    if (!obj) return { found: false }

    for (const key in obj) {
      const value = obj[key]
      if (typeof value === 'string') {
        if (detectSQLInjection(value)) {
          return { found: true, type: 'SQL_INJECTION' }
        }
        if (detectXSS(value)) {
          return { found: true, type: 'XSS' }
        }
      } else if (typeof value === 'object' && value !== null) {
        const result = checkInput(value, source)
        if (result.found) return result
      }
    }
    return { found: false }
  }

  // Verificar query params
  const queryCheck = checkInput(req.query, 'query')
  if (queryCheck.found) {
    await saveSecurityEvent(
      queryCheck.type!,
      'HIGH',
      req,
      `Tentativa de ${queryCheck.type} detectada em query params`,
      true
    )
    await logger.securityAlert(`Tentativa de ${queryCheck.type} bloqueada`, {
      ip,
      endpoint: req.path,
      method: req.method,
      details: { source: 'query', value: req.query },
    })
    return res.status(400).json({ error: 'Requisição inválida detectada' })
  }

  // Verificar body params
  if (req.body) {
    const bodyCheck = checkInput(req.body, 'body')
    if (bodyCheck.found) {
      await saveSecurityEvent(
        bodyCheck.type!,
        'HIGH',
        req,
        `Tentativa de ${bodyCheck.type} detectada em body`,
        true
      )
      await logger.securityAlert(`Tentativa de ${bodyCheck.type} bloqueada`, {
        ip,
        endpoint: req.path,
        method: req.method,
        details: { source: 'body', value: req.body },
      })
      return res.status(400).json({ error: 'Requisição inválida detectada' })
    }
  }

  // Verificar route params
  const paramsCheck = checkInput(req.params, 'params')
  if (paramsCheck.found) {
    await saveSecurityEvent(
      paramsCheck.type!,
      'HIGH',
      req,
      `Tentativa de ${paramsCheck.type} detectada em route params`,
      true
    )
    await logger.securityAlert(`Tentativa de ${paramsCheck.type} bloqueada`, {
      ip,
      endpoint: req.path,
      method: req.method,
      details: { source: 'params', value: req.params },
    })
    return res.status(400).json({ error: 'Requisição inválida detectada' })
  }

  // Detectar força bruta em tentativas de login
  if (req.path.includes('/auth/login') && req.method === 'POST') {
    const attempts = failedLoginAttempts.get(ip) || { count: 0, lastAttempt: new Date() }
    const now = new Date()
    const timeDiff = now.getTime() - attempts.lastAttempt.getTime()

    // Reset contador se passou mais de 15 minutos
    if (timeDiff > 15 * 60 * 1000) {
      attempts.count = 0
    }

    // Se múltiplas tentativas em pouco tempo
    if (attempts.count >= 5) {
      blockedIPs.set(ip, {
        blocked: true,
        attempts: attempts.count,
        lastAttempt: now,
      })

      await saveSecurityEvent(
        'BRUTE_FORCE',
        'CRITICAL',
        req,
        `Força bruta detectada: ${attempts.count} tentativas de login falhas`,
        true
      )

      await logger.securityAlert(`Força bruta detectada e IP bloqueado: ${ip}`, {
        ip,
        endpoint: req.path,
        method: req.method,
        details: { attempts: attempts.count },
      })

      return res.status(429).json({
        error: 'Muitas tentativas de login. IP bloqueado temporariamente.',
      })
    }
  }

  // Log de requisições suspeitas (muitas requisições rápidas)
  const suspicious = blockedIPs.get(ip)
  if (suspicious && suspicious.attempts > 10) {
    await logger.warning(`Múltiplas requisições suspeitas de: ${ip}`, {
      ip,
      endpoint: req.path,
      method: req.method,
    })
  }

  next()
}

// Função auxiliar para marcar login falho
export const recordFailedLogin = (ip: string) => {
  const attempts = failedLoginAttempts.get(ip) || { count: 0, lastAttempt: new Date() }
  attempts.count++
  attempts.lastAttempt = new Date()
  failedLoginAttempts.set(ip, attempts)
}

// Função auxiliar para resetar tentativas após login bem-sucedido
export const resetFailedLoginAttempts = (ip: string) => {
  failedLoginAttempts.delete(ip)
  const blocked = blockedIPs.get(ip)
  if (blocked) {
    blockedIPs.set(ip, { ...blocked, blocked: false })
  }
}

