import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SECURITY_ALERT = 'SECURITY_ALERT',
}

interface LogData {
  level: LogLevel
  message: string
  ip?: string
  userAgent?: string
  userId?: string
  endpoint?: string
  method?: string
  statusCode?: number
  details?: any
}

const logsDir = path.join(__dirname, '../../logs')

// Garantir que o diretório existe
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

const securityLogFile = path.join(logsDir, 'security.log')
const auditLogFile = path.join(logsDir, 'audit.log')

function formatLogMessage(data: LogData): string {
  const timestamp = new Date().toISOString()
  const details = data.details ? JSON.stringify(data.details) : ''
  return `[${timestamp}] [${data.level}] ${data.message} | IP: ${data.ip || 'N/A'} | Endpoint: ${data.endpoint || 'N/A'} | Method: ${data.method || 'N/A'} | User: ${data.userId || 'N/A'} | Details: ${details}\n`
}

function formatAuditMessage(data: any): string {
  const timestamp = new Date().toISOString()
  return `[${timestamp}] [${data.action}] User: ${data.userId} | Entity: ${data.entityType} | ID: ${data.entityId || 'N/A'} | Description: ${data.description} | IP: ${data.ip || 'N/A'}\n`
}

export const logger = {
  async log(data: LogData): Promise<void> {
    try {
      // Log no banco de dados
      await prisma.securityLog.create({
        data: {
          level: data.level,
          message: data.message,
          ip: data.ip,
          userAgent: data.userAgent,
          userId: data.userId,
          endpoint: data.endpoint,
          method: data.method,
          statusCode: data.statusCode,
          details: data.details ? JSON.stringify(data.details) : null,
        },
      })

      // Log no arquivo
      const logMessage = formatLogMessage(data)
      fs.appendFileSync(securityLogFile, logMessage, 'utf8')
    } catch (error) {
      // Fallback: apenas logar no arquivo se o banco falhar
      console.error('Erro ao salvar log no banco:', error)
      try {
        const logMessage = formatLogMessage(data)
        fs.appendFileSync(securityLogFile, logMessage, 'utf8')
      } catch (fileError) {
        console.error('Erro ao salvar log no arquivo:', fileError)
      }
    }
  },

  async audit(data: {
    userId: string
    action: string
    entityType: string
    entityId?: string
    description: string
    ip?: string
    userAgent?: string
    changes?: any
  }): Promise<void> {
    try {
      // Log no banco de dados
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          description: data.description,
          ip: data.ip,
          userAgent: data.userAgent,
          changes: data.changes ? JSON.stringify(data.changes) : null,
        },
      })

      // Log no arquivo
      const logMessage = formatAuditMessage(data)
      fs.appendFileSync(auditLogFile, logMessage, 'utf8')
    } catch (error) {
      // Fallback: apenas logar no arquivo se o banco falhar
      console.error('Erro ao salvar audit log no banco:', error)
      try {
        const logMessage = formatAuditMessage(data)
        fs.appendFileSync(auditLogFile, logMessage, 'utf8')
      } catch (fileError) {
        console.error('Erro ao salvar audit log no arquivo:', fileError)
      }
    }
  },

  info(message: string, data?: Partial<LogData>): Promise<void> {
    return this.log({ ...data, level: LogLevel.INFO, message })
  },

  warning(message: string, data?: Partial<LogData>): Promise<void> {
    return this.log({ ...data, level: LogLevel.WARNING, message })
  },

  error(message: string, data?: Partial<LogData>): Promise<void> {
    return this.log({ ...data, level: LogLevel.ERROR, message })
  },

  securityAlert(message: string, data?: Partial<LogData>): Promise<void> {
    return this.log({ ...data, level: LogLevel.SECURITY_ALERT, message })
  },
}

