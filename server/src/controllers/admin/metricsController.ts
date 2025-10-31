import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AdminRequest } from '../../middleware/adminAuth'

const prisma = new PrismaClient()

// Métricas gerais do dashboard
export const getDashboardMetrics = async (req: AdminRequest, res: Response) => {
  try {
    const now = new Date()
    const today = new Date(now.setHours(0, 0, 0, 0))
    const thisWeek = new Date(now.setDate(now.getDate() - 7))
    const thisMonth = new Date(now.setMonth(now.getMonth() - 1))

    // Vendas
    const totalRevenue = await prisma.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: { total: true },
    })

    const todayRevenue = await prisma.order.aggregate({
      where: {
        status: 'DELIVERED',
        createdAt: { gte: today },
      },
      _sum: { total: true },
    })

    const thisWeekRevenue = await prisma.order.aggregate({
      where: {
        status: 'DELIVERED',
        createdAt: { gte: thisWeek },
      },
      _sum: { total: true },
    })

    // Pedidos
    const totalOrders = await prisma.order.count()
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } })
    const completedOrders = await prisma.order.count({ where: { status: 'DELIVERED' } })
    const todayOrders = await prisma.order.count({ where: { createdAt: { gte: today } } })

    // Usuários
    const totalUsers = await prisma.user.count()
    const todayUsers = await prisma.user.count({ where: { createdAt: { gte: today } } })
    const thisWeekUsers = await prisma.user.count({ where: { createdAt: { gte: thisWeek } } })
    const usersWithOrders = await prisma.order.groupBy({
      by: ['userId'],
      _count: true,
    })

    // Produtos
    const totalProducts = await prisma.product.count()
    const outOfStock = await prisma.product.count({ where: { stock: 0 } })
    const inStock = await prisma.product.count({ where: { stock: { gt: 0 } } })

    // Ticket médio
    const avgTicket = totalOrders > 0
      ? (totalRevenue._sum.total || 0) / totalOrders
      : 0

    res.json({
      sales: {
        totalRevenue: totalRevenue._sum.total || 0,
        todayRevenue: todayRevenue._sum.total || 0,
        thisWeekRevenue: thisWeekRevenue._sum.total || 0,
        avgTicket,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        today: todayOrders,
      },
      users: {
        total: totalUsers,
        today: todayUsers,
        thisWeek: thisWeekUsers,
        withOrders: usersWithOrders.length,
      },
      products: {
        total: totalProducts,
        inStock,
        outOfStock,
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar métricas' })
  }
}

// Métricas de vendas
export const getSalesMetrics = async (req: AdminRequest, res: Response) => {
  try {
    const { period = '30' } = req.query
    const days = parseInt(period as string)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Receita por período
    const revenueByPeriod = await prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: startDate },
      },
      _sum: { total: true },
      _count: true,
    })

    // Vendas diárias (últimos N dias) - usando Prisma groupBy ao invés de raw query
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'COMPLETED',
      },
      select: {
        createdAt: true,
        total: true,
      },
    })

    // Agrupar por data
    const dailySalesMap = new Map<string, { total: number; count: number }>()
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0]
      const existing = dailySalesMap.get(date) || { total: 0, count: 0 }
      dailySalesMap.set(date, {
        total: existing.total + order.total,
        count: existing.count + 1,
      })
    })

    const dailySales = Array.from(dailySalesMap.entries())
      .map(([date, data]) => ({ date, total: data.total, count: data.count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Produtos mais vendidos
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: 'DELIVERED',
        },
      },
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    })

    const productIds = topProducts.map((p) => p.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
      },
    })

    const topProductsWithNames = topProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return {
        productId: item.productId,
        productName: product?.name || 'Produto não encontrado',
        quantity: item._sum.quantity || 0,
        revenue: (item._sum.price || 0) * (item._sum.quantity || 0),
      }
    })

    // Categorias mais vendidas - buscar produtos e agrupar por categoria
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
          status: 'DELIVERED',
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    })

    // Agrupar por categoria
    const categorySales = new Map<string, { quantity: number; categoryName: string }>()
    orderItems.forEach((item) => {
      const categoryId = item.product.categoryId
      const categoryName = item.product.category.name
      const existing = categorySales.get(categoryId) || { quantity: 0, categoryName }
      categorySales.set(categoryId, {
        quantity: existing.quantity + item.quantity,
        categoryName,
      })
    })

    const topCategories = Array.from(categorySales.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.categoryName,
        quantity: data.quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    res.json({
      period: days,
      revenueByStatus: revenueByPeriod,
      dailySales,
      topProducts: topProductsWithNames,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar métricas de vendas' })
  }
}

// Métricas de usuários
export const getUserMetrics = async (req: AdminRequest, res: Response) => {
  try {
    const { period = '30' } = req.query
    const days = parseInt(period as string)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Crescimento de usuários
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
    })

    // Agrupar por data
    const userGrowthMap = new Map<string, number>()
    users.forEach((user) => {
      const date = user.createdAt.toISOString().split('T')[0]
      userGrowthMap.set(date, (userGrowthMap.get(date) || 0) + 1)
    })

    const userGrowth = Array.from(userGrowthMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Usuários ativos (com pedidos nos últimos 7/30 dias)
    const activeUsers7d = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    })

    const activeUsers30d = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    })

    // Segmentação
    const usersWithOrders = await prisma.order.groupBy({
      by: ['userId'],
      _count: true,
    })

    const usersWithoutOrders = await prisma.user.count({
      where: {
        id: {
          notIn: usersWithOrders.map((u) => u.userId),
        },
      },
    })

    res.json({
      period: days,
      userGrowth,
      activeUsers: {
        last7Days: activeUsers7d.length,
        last30Days: activeUsers30d.length,
      },
      segmentation: {
        withOrders: usersWithOrders.length,
        withoutOrders: usersWithoutOrders,
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar métricas de usuários' })
  }
}

// Métricas de produtos
export const getProductMetrics = async (req: AdminRequest, res: Response) => {
  try {
    // Produtos em estoque vs esgotados
    const stockStatus = await prisma.product.groupBy({
      by: [],
      _count: true,
      _sum: {
        stock: true,
      },
      where: {},
    })

    // Produtos mais favoritados
    const topFavorited = await prisma.favorite.groupBy({
      by: ['productId'],
      _count: true,
      orderBy: {
        _count: {
          productId: 'desc',
        },
      },
      take: 10,
    })

    const productIds = topFavorited.map((f) => f.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
      },
    })

    const topFavoritedWithNames = topFavorited.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return {
        productId: item.productId,
        productName: product?.name || 'Produto não encontrado',
        favoritesCount: item._count,
      }
    })

    // Produtos mais avaliados
    const topReviewed = await prisma.review.groupBy({
      by: ['productId'],
      _count: true,
      _avg: {
        rating: true,
      },
      orderBy: {
        _count: {
          productId: 'desc',
        },
      },
      take: 10,
    })

    const reviewedProductIds = topReviewed.map((r) => r.productId)
    const reviewedProducts = await prisma.product.findMany({
      where: { id: { in: reviewedProductIds } },
      select: {
        id: true,
        name: true,
        rating: true,
      },
    })

    const topReviewedWithNames = topReviewed.map((item) => {
      const product = reviewedProducts.find((p) => p.id === item.productId)
      return {
        productId: item.productId,
        productName: product?.name || 'Produto não encontrado',
        reviewsCount: item._count,
        avgRating: item._avg.rating || 0,
      }
    })

    res.json({
      stock: {
        total: stockStatus[0]?._count || 0,
        totalStock: stockStatus[0]?._sum.stock || 0,
        inStock: await prisma.product.count({ where: { stock: { gt: 0 } } }),
        outOfStock: await prisma.product.count({ where: { stock: 0 } }),
      },
      topFavorited: topFavoritedWithNames,
      topReviewed: topReviewedWithNames,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar métricas de produtos' })
  }
}

// Métricas de segurança
export const getSecurityMetrics = async (req: AdminRequest, res: Response) => {
  try {
    const { period = '30' } = req.query
    const days = parseInt(period as string)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Eventos de segurança por tipo
    const eventsByType = await prisma.securityEvent.groupBy({
      by: ['eventType'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: true,
    })

    // Eventos por severidade
    const eventsBySeverity = await prisma.securityEvent.groupBy({
      by: ['severity'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: true,
    })

    // IPs mais problemáticos
    const topIPs = await prisma.securityEvent.groupBy({
      by: ['ip'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: true,
      orderBy: {
        _count: {
          ip: 'desc',
        },
      },
      take: 10,
    })

    // Eventos bloqueados vs permitidos
    const blockedEvents = await prisma.securityEvent.count({
      where: {
        createdAt: { gte: startDate },
        blocked: true,
      },
    })

    const totalEvents = await prisma.securityEvent.count({
      where: {
        createdAt: { gte: startDate },
      },
    })

    // Logins falhos
    const failedLogins = await prisma.securityLog.count({
      where: {
        createdAt: { gte: startDate },
        level: 'WARNING',
        message: {
          contains: 'login',
        },
      },
    })

    res.json({
      period: days,
      eventsByType,
      eventsBySeverity,
      topIPs,
      blocked: {
        blocked: blockedEvents,
        total: totalEvents,
        allowed: totalEvents - blockedEvents,
      },
      failedLogins,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar métricas de segurança' })
  }
}

