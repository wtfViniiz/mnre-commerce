import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json(orders)
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    const { id } = req.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    if (order.userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    res.json(order)
  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    const { items, address, paymentId } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Itens são obrigatórios' })
    }

    if (!address) {
      return res.status(400).json({ error: 'Endereço é obrigatório' })
    }

    // Buscar produtos e calcular total
    let total = 0
    const productPrices: Record<string, number> = {}
    
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })
      if (product) {
        productPrices[item.productId] = product.price
        total += product.price * item.quantity
      }
    }

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        userId: req.userId,
        items: JSON.stringify(items),
        total,
        address: JSON.stringify(address),
        paymentId,
        status: 'PENDING',
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productPrices[item.productId] || 0,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    // Limpar carrinho
    await prisma.cart.update({
      where: { userId: req.userId },
      data: {
        items: JSON.stringify([]),
      },
    })

    res.status(201).json(order)
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })

    res.json(order)
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

