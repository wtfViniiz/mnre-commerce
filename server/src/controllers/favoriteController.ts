import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: req.userId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const favoritesWithParsedImages = favorites.map((favorite) => ({
      ...favorite,
      product: favorite.product
        ? {
            ...favorite.product,
            images: JSON.parse(favorite.product.images || '[]'),
          }
        : null,
    }))

    res.json(favoritesWithParsedImages)
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const addFavorite = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    const { productId } = req.body

    if (!productId) {
      return res.status(400).json({ error: 'productId é obrigatório' })
    }

    // Verificar se já é favorito
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: req.userId,
          productId,
        },
      },
    })

    if (existing) {
      return res.status(400).json({ error: 'Produto já está nos favoritos' })
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.userId,
        productId,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    })

    res.status(201).json({
      ...favorite,
      product: favorite.product
        ? {
            ...favorite.product,
            images: JSON.parse(favorite.product.images || '[]'),
          }
        : null,
    })
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const removeFavorite = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    const { productId } = req.params

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: req.userId,
          productId,
        },
      },
    })

    if (!favorite) {
      return res.status(404).json({ error: 'Favorito não encontrado' })
    }

    await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId: req.userId,
          productId,
        },
      },
    })

    res.json({ message: 'Favorito removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover favorito:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const checkFavorite = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.json({ isFavorite: false })
    }

    const { productId } = req.params

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: req.userId,
          productId,
        },
      },
    })

    res.json({ isFavorite: !!favorite })
  } catch (error) {
    console.error('Erro ao verificar favorito:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

