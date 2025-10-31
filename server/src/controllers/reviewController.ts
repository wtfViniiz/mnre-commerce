import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

export const getProductReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json(reviews)
  } catch (error) {
    console.error('Erro ao buscar reviews:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    const { productId } = req.params
    const { rating, comment } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating deve ser entre 1 e 5' })
    }

    // Verificar se usuário já avaliou
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: req.userId,
        },
      },
    })

    if (existingReview) {
      return res.status(400).json({ error: 'Você já avaliou este produto' })
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.userId,
        rating: Number(rating),
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Atualizar rating médio do produto
    const allReviews = await prisma.review.findMany({
      where: { productId },
    })
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.product.update({
      where: { id: productId },
      data: { rating: avgRating },
    })

    res.status(201).json(review)
  } catch (error) {
    console.error('Erro ao criar review:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    const { id } = req.params
    const { rating, comment } = req.body

    const review = await prisma.review.findUnique({
      where: { id },
    })

    if (!review) {
      return res.status(404).json({ error: 'Review não encontrado' })
    }

    if (review.userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating: Number(rating) }),
        ...(comment !== undefined && { comment }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Atualizar rating médio do produto
    const allReviews = await prisma.review.findMany({
      where: { productId: review.productId },
    })
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.product.update({
      where: { id: review.productId },
      data: { rating: avgRating },
    })

    res.json(updatedReview)
  } catch (error) {
    console.error('Erro ao atualizar review:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado' })
    }

    const { id } = req.params

    const review = await prisma.review.findUnique({
      where: { id },
    })

    if (!review) {
      return res.status(404).json({ error: 'Review não encontrado' })
    }

    if (review.userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    await prisma.review.delete({
      where: { id },
    })

    // Atualizar rating médio do produto
    const allReviews = await prisma.review.findMany({
      where: { productId: review.productId },
    })
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0

    await prisma.product.update({
      where: { id: review.productId },
      data: { rating: avgRating },
    })

    res.json({ message: 'Review deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar review:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

