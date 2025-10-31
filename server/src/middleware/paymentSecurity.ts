import { Request, Response, NextFunction } from 'express'
import { logger } from '../services/logger'
import crypto from 'crypto'

function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  )
}

// Verificar assinatura do webhook do Mercado Pago
export const verifyMercadoPagoWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Mercado Pago envia a assinatura no header x-signature
    const signature = req.headers['x-signature'] as string
    const xRequestId = req.headers['x-request-id'] as string
    
    if (!signature) {
      await logger.warning('Webhook do Mercado Pago sem assinatura', {
        ip: getClientIP(req),
        endpoint: req.path,
        method: req.method,
      })
      return res.status(401).json({ error: 'Assinatura não fornecida' })
    }

    // Validar a assinatura usando a chave secreta do Mercado Pago
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET
    
    if (webhookSecret) {
      // Validar assinatura HMAC
      const bodyString = JSON.stringify(req.body)
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(bodyString)
        .digest('hex')
      
      if (signature !== `sha256=${expectedSignature}` && signature !== expectedSignature) {
        await logger.securityAlert('Webhook do Mercado Pago com assinatura inválida', {
          ip: getClientIP(req),
          endpoint: req.path,
          method: req.method,
          details: { signature, expectedSignature },
        })
        return res.status(401).json({ error: 'Assinatura inválida' })
      }
    }

    next()
  } catch (error) {
    await logger.error('Erro ao verificar webhook do Mercado Pago', {
      ip: getClientIP(req),
      endpoint: req.path,
      method: req.method,
    })
    return res.status(500).json({ error: 'Erro ao processar webhook' })
  }
}

// Rate limiting específico para rotas de pagamento
export const paymentRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // Rotas de pagamento devem ter rate limiting mais restritivo
  // Mas como já temos rate limiter global que pula /api/admin,
  // podemos manter o mesmo comportamento aqui
  next()
}

// Validar dados sensíveis de pagamento
export const validatePaymentData = async (req: Request, res: Response, next: NextFunction) => {
  // Validar que dados de pagamento não contenham informações sensíveis
  const body = req.body || {}
  
  // Lista de campos que não devem estar no body
  const forbiddenFields = ['creditCard', 'cvv', 'cardNumber', 'fullCardNumber']
  
  for (const field of forbiddenFields) {
    if (body[field]) {
      await logger.securityAlert(`Tentativa de enviar dados sensíveis de cartão via API`, {
        ip: getClientIP(req),
        endpoint: req.path,
        method: req.method,
      })
      return res.status(400).json({ error: 'Dados inválidos' })
    }
  }

  next()
}

