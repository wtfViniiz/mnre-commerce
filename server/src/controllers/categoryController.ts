import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: true,
        parent: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    res.json({ categories })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const getCategoryById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        products: {
          include: {
            category: true,
          },
        },
      },
    })

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    res.json(category)
  } catch (error) {
    console.error('Erro ao buscar categoria:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

