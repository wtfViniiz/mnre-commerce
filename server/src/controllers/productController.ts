import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const {
      categoryId,
      minPrice,
      maxPrice,
      minRating,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    // Construir filtros
    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId as string
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = Number(minPrice)
      if (maxPrice) where.price.lte = Number(maxPrice)
    }

    if (minRating) {
      where.rating = { gte: Number(minRating) }
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    // Ordenação
    const orderBy: any = {}
    if (sortBy === 'price' || sortBy === 'rating' || sortBy === 'name' || sortBy === 'createdAt') {
      orderBy[sortBy] = sortOrder
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.product.count({ where }),
    ])

    // Parse images
    const productsWithParsedImages = products.map((product) => ({
      ...product,
      images: JSON.parse(product.images || '[]'),
    }))

    res.json({
      products: productsWithParsedImages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
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
        },
      },
    })

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }

    res.json({
      ...product,
      images: JSON.parse(product.images || '[]'),
    })
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, images, categoryId, stock } = req.body

    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        images: JSON.stringify(images || []),
        categoryId,
        stock: Number(stock) || 0,
      },
      include: {
        category: true,
      },
    })

    res.status(201).json({
      ...product,
      images: JSON.parse(product.images || '[]'),
    })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, price, images, categoryId, stock } = req.body

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: Number(price) }),
        ...(images && { images: JSON.stringify(images) }),
        ...(categoryId && { categoryId }),
        ...(stock !== undefined && { stock: Number(stock) }),
      },
      include: {
        category: true,
      },
    })

    res.json({
      ...product,
      images: JSON.parse(product.images || '[]'),
    })
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    await prisma.product.delete({
      where: { id },
    })

    res.json({ message: 'Produto deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

