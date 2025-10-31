import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AdminRequest } from '../../middleware/adminAuth'
import { logger } from '../../services/logger'

const prisma = new PrismaClient()

function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  )
}

// ========== PRODUTOS ==========
export const getProducts = async (req: AdminRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', search } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const where = search
      ? {
          OR: [
            { name: { contains: search as string } },
            { description: { contains: search as string } },
          ],
        }
      : {}

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          category: true,
          _count: {
            select: {
              reviews: true,
              favorites: true,
              orderItems: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    res.json({
      products,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar produtos' })
  }
}

export const updateProduct = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, price, stock, categoryId, images } = req.body

    const oldProduct = await prisma.product.findUnique({ where: { id } })
    if (!oldProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        images: JSON.stringify(images || []),
      },
      include: { category: true },
    })

    // Log de auditoria
    await logger.audit({
      userId: req.user!.id,
      action: 'UPDATE',
      entityType: 'PRODUCT',
      entityId: id,
      description: `Produto atualizado: ${product.name}`,
      ip: getClientIP(req),
      userAgent: req.headers['user-agent'],
      changes: {
        before: oldProduct,
        after: product,
      },
    })

    res.json(product)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar produto' })
  }
}

export const deleteProduct = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }

    await prisma.product.delete({ where: { id } })

    // Log de auditoria
    await logger.audit({
      userId: req.user!.id,
      action: 'DELETE',
      entityType: 'PRODUCT',
      entityId: id,
      description: `Produto deletado: ${product.name}`,
      ip: getClientIP(req),
      userAgent: req.headers['user-agent'],
    })

    res.json({ message: 'Produto deletado com sucesso' })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao deletar produto' })
  }
}

// ========== USUÁRIOS ==========
export const getUsers = async (req: AdminRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', search, role } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
      ]
    }
    if (role) {
      where.role = role
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
              favorites: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    res.json({
      users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar usuários' })
  }
}

export const updateUser = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params
    const { name, email, role } = req.body

    const oldUser = await prisma.user.findUnique({ where: { id } })
    if (!oldUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name, email, role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    // Log de auditoria
    await logger.audit({
      userId: req.user!.id,
      action: 'UPDATE',
      entityType: 'USER',
      entityId: id,
      description: `Usuário atualizado: ${user.email}`,
      ip: getClientIP(req),
      userAgent: req.headers['user-agent'],
      changes: {
        before: oldUser,
        after: user,
      },
    })

    res.json(user)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar usuário' })
  }
}

// ========== PEDIDOS ==========
export const getOrders = async (req: AdminRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ])

    res.json({
      orders,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar pedidos' })
  }
}

export const updateOrderStatus = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const oldOrder = await prisma.order.findUnique({ where: { id } })
    if (!oldOrder) {
      return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })

    // Log de auditoria
    await logger.audit({
      userId: req.user!.id,
      action: 'UPDATE',
      entityType: 'ORDER',
      entityId: id,
      description: `Status do pedido alterado de ${oldOrder.status} para ${status}`,
      ip: getClientIP(req),
      userAgent: req.headers['user-agent'],
      changes: {
        before: { status: oldOrder.status },
        after: { status },
      },
    })

    res.json(order)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar pedido' })
  }
}

// ========== CATEGORIAS ==========
export const getCategories = async (req: AdminRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    res.json(categories)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar categorias' })
  }
}

export const createCategory = async (req: AdminRequest, res: Response) => {
  try {
    const { name, slug, parentId } = req.body

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId,
      },
    })

    // Log de auditoria
    await logger.audit({
      userId: req.user!.id,
      action: 'CREATE',
      entityType: 'CATEGORY',
      entityId: category.id,
      description: `Categoria criada: ${category.name}`,
      ip: getClientIP(req),
      userAgent: req.headers['user-agent'],
    })

    res.json(category)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao criar categoria' })
  }
}

export const updateCategory = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params
    const { name, slug, parentId } = req.body

    const oldCategory = await prisma.category.findUnique({ where: { id } })
    if (!oldCategory) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, parentId },
    })

    // Log de auditoria
    await logger.audit({
      userId: req.user!.id,
      action: 'UPDATE',
      entityType: 'CATEGORY',
      entityId: id,
      description: `Categoria atualizada: ${category.name}`,
      ip: getClientIP(req),
      userAgent: req.headers['user-agent'],
      changes: {
        before: oldCategory,
        after: category,
      },
    })

    res.json(category)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao atualizar categoria' })
  }
}

export const deleteCategory = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params

    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    await prisma.category.delete({ where: { id } })

    // Log de auditoria
    await logger.audit({
      userId: req.user!.id,
      action: 'DELETE',
      entityType: 'CATEGORY',
      entityId: id,
      description: `Categoria deletada: ${category.name}`,
      ip: getClientIP(req),
      userAgent: req.headers['user-agent'],
    })

    res.json({ message: 'Categoria deletada com sucesso' })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao deletar categoria' })
  }
}

