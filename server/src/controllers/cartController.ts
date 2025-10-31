import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: req.userId,
          items: JSON.stringify([]),
        },
      })
    }

    const items = JSON.parse(cart.items || '[]')

    // Buscar informações completas dos produtos
    const itemsWithProducts = await Promise.all(
      items.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true },
        })
        return {
          ...item,
          product: product
            ? {
                ...product,
                images: JSON.parse(product.images || '[]'),
              }
            : null,
        }
      })
    )

    res.json({
      ...cart,
      items: itemsWithProducts,
    })
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    const { productId, quantity = 1 } = req.body

    if (!productId) {
      return res.status(400).json({ error: 'productId é obrigatório' })
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: req.userId,
          items: JSON.stringify([]),
        },
      })
    }

    const items = JSON.parse(cart.items || '[]')
    const existingItemIndex = items.findIndex(
      (item: any) => item.productId === productId
    )

    if (existingItemIndex >= 0) {
      items[existingItemIndex].quantity += Number(quantity)
    } else {
      items.push({ productId, quantity: Number(quantity) })
    }

    const updatedCart = await prisma.cart.update({
      where: { userId: req.userId },
      data: {
        items: JSON.stringify(items),
      },
    })

    const itemsWithProducts = await Promise.all(
      items.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true },
        })
        return {
          ...item,
          product: product
            ? {
                ...product,
                images: JSON.parse(product.images || '[]'),
              }
            : null,
        }
      })
    )

    res.json({
      ...updatedCart,
      items: itemsWithProducts,
    })
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    const { productId } = req.params
    const { quantity } = req.body

    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
    })

    if (!cart) {
      return res.status(404).json({ error: 'Carrinho não encontrado' })
    }

    const items = JSON.parse(cart.items || '[]')
    const itemIndex = items.findIndex((item: any) => item.productId === productId)

    if (itemIndex < 0) {
      return res.status(404).json({ error: 'Item não encontrado no carrinho' })
    }

    if (Number(quantity) <= 0) {
      items.splice(itemIndex, 1)
    } else {
      items[itemIndex].quantity = Number(quantity)
    }

    const updatedCart = await prisma.cart.update({
      where: { userId: req.userId },
      data: {
        items: JSON.stringify(items),
      },
    })

    const itemsWithProducts = await Promise.all(
      items.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true },
        })
        return {
          ...item,
          product: product
            ? {
                ...product,
                images: JSON.parse(product.images || '[]'),
              }
            : null,
        }
      })
    )

    res.json({
      ...updatedCart,
      items: itemsWithProducts,
    })
  } catch (error) {
    console.error('Erro ao atualizar item do carrinho:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    const { productId } = req.params

    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
    })

    if (!cart) {
      return res.status(404).json({ error: 'Carrinho não encontrado' })
    }

    const items = JSON.parse(cart.items || '[]')
    const filteredItems = items.filter((item: any) => item.productId !== productId)

    const updatedCart = await prisma.cart.update({
      where: { userId: req.userId },
      data: {
        items: JSON.stringify(filteredItems),
      },
    })

    const itemsWithProducts = await Promise.all(
      filteredItems.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true },
        })
        return {
          ...item,
          product: product
            ? {
                ...product,
                images: JSON.parse(product.images || '[]'),
              }
            : null,
        }
      })
    )

    res.json({
      ...updatedCart,
      items: itemsWithProducts,
    })
  } catch (error) {
    console.error('Erro ao remover do carrinho:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    const cart = await prisma.cart.update({
      where: { userId: req.userId },
      data: {
        items: JSON.stringify([]),
      },
    })

    res.json({
      ...cart,
      items: [],
    })
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

