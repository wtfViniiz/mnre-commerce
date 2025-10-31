import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { createPreference, getPayment } from '../services/mercadoPagoService'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'
import { Response } from 'express'
import { verifyMercadoPagoWebhook, validatePaymentData } from '../middleware/paymentSecurity'
import { validateQuantity } from '../middleware/inputValidation'
import { body, validationResult } from 'express-validator'
import { logger } from '../services/logger'

const router = Router()
const prisma = new PrismaClient()

// Rotas de pagamento requerem autenticação
router.use('/preference', authenticate)
router.use('/:paymentId', authenticate)

// Criar preferência de pagamento
router.post(
  '/preference',
  validatePaymentData,
  [
    body('items').isArray({ min: 1 }).withMessage('Deve ter pelo menos 1 item'),
    body('items.*.productId').notEmpty().withMessage('ID do produto é obrigatório'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que 0'),
    body('orderId').optional().isString(),
  ],
  async (req: AuthRequest, res: Response) => {
    // Verificar erros de validação
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Erro de validação',
        details: errors.array(),
      })
    }

    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Não autenticado' })
      }

      const { items, orderId } = req.body

    // Buscar informações dos produtos
    const products = await Promise.all(
      items.map((item: any) =>
        prisma.product.findUnique({
          where: { id: item.productId },
        })
      )
    )

    const preferenceItems = products
      .filter(Boolean)
      .map((product, index) => ({
        title: product!.name,
        quantity: items[index].quantity,
        unit_price: product!.price,
      }))

    const preference = await createPreference({
      items: preferenceItems,
      external_reference: orderId || `order-${req.userId}-${Date.now()}`,
      back_urls: {
        success: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders`,
        failure: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout?error=payment_failed`,
        pending: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders?status=pending`,
      },
      auto_return: 'approved',
    })

    res.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    })
  } catch (error) {
    console.error('Erro ao criar preferência:', error)
    res.status(500).json({ error: 'Erro ao processar pagamento' })
  }
})

// Webhook do Mercado Pago (protegido com validação de assinatura)
router.post('/webhook', verifyMercadoPagoWebhook, async (req, res) => {
  try {
    const { type, data } = req.body

    if (type === 'payment') {
      const paymentId = data.id
      const payment = await getPayment(paymentId)

      // Atualizar pedido baseado no status do pagamento
      if (payment.status === 'approved') {
        await prisma.order.updateMany({
          where: {
            paymentId: paymentId.toString(),
          },
          data: {
            status: 'PROCESSING',
          },
        })
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        await prisma.order.updateMany({
          where: {
            paymentId: paymentId.toString(),
          },
          data: {
            status: 'CANCELLED',
          },
        })
      }
    }

    res.status(200).send('OK')
  } catch (error) {
    console.error('Erro no webhook:', error)
    res.status(500).json({ error: 'Erro ao processar webhook' })
  }
})

// Verificar status do pagamento
router.get('/:paymentId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params

    const payment = await getPayment(paymentId)

    res.json(payment)
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error)
    res.status(500).json({ error: 'Erro ao buscar pagamento' })
  }
})

export default router

