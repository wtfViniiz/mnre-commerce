import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AdminRequest } from '../../middleware/adminAuth'

const prisma = new PrismaClient()

// Logs de segurança
export const getSecurityLogs = async (req: AdminRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      level,
      ip,
      startDate,
      endDate,
    } = req.query

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const where: any = {}
    if (level) where.level = level
    if (ip) where.ip = { contains: ip as string }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate as string)
      if (endDate) where.createdAt.lte = new Date(endDate as string)
    }

    const [logs, total] = await Promise.all([
      prisma.securityLog.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.securityLog.count({ where }),
    ])

    const logsWithUser = await Promise.all(
      logs.map(async (log) => {
        if (log.userId) {
          const user = await prisma.user.findUnique({
            where: { id: log.userId },
            select: { name: true, email: true },
          })
          return { ...log, user }
        }
        return log
      })
    )

    res.json({
      logs: logsWithUser,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar logs de segurança' })
  }
}

// Logs de auditoria
export const getAuditLogs = async (req: AdminRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      userId,
      action,
      entityType,
      startDate,
      endDate,
    } = req.query

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const where: any = {}
    if (userId) where.userId = userId
    if (action) where.action = action
    if (entityType) where.entityType = entityType
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate as string)
      if (endDate) where.createdAt.lte = new Date(endDate as string)
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
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
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ])

    res.json({
      logs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar logs de auditoria' })
  }
}

// Eventos de segurança
export const getSecurityEvents = async (req: AdminRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      eventType,
      severity,
      blocked,
      ip,
      startDate,
      endDate,
    } = req.query

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const where: any = {}
    if (eventType) where.eventType = eventType
    if (severity) where.severity = severity
    if (blocked !== undefined) where.blocked = blocked === 'true'
    if (ip) where.ip = { contains: ip as string }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate as string)
      if (endDate) where.createdAt.lte = new Date(endDate as string)
    }

    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.securityEvent.count({ where }),
    ])

    res.json({
      events,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao buscar eventos de segurança' })
  }
}

