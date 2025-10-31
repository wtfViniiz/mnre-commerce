import { Request, Response, NextFunction } from 'express'
import { logger } from '../services/logger'

// Tipos de arquivos permitidos (extensões)
const ALLOWED_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
const ALLOWED_DOCUMENT_TYPES = ['.pdf', '.doc', '.docx']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Tipos MIME permitidos
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  )
}

/**
 * Validar upload de arquivos
 * Para uso com multer ou similar
 */
export const validateFileUpload = (
  allowedTypes: string[] = ALLOWED_IMAGE_TYPES,
  maxSize: number = MAX_FILE_SIZE
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Se não há arquivos, continuar
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return next()
    }

    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat()
    const ip = getClientIP(req)

    for (const file of files) {
      // Verificar tamanho
      if (file.size > maxSize) {
        await logger.warning(`Tentativa de upload de arquivo muito grande: ${file.originalname}`, {
          ip,
          endpoint: req.path,
          method: req.method,
          details: { size: file.size, maxSize },
        })
        return res.status(400).json({
          error: `Arquivo ${file.originalname} excede o tamanho máximo de ${maxSize / 1024 / 1024}MB`,
        })
      }

      // Verificar extensão
      const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'))
      if (!allowedTypes.includes(ext)) {
        await logger.warning(`Tentativa de upload de tipo de arquivo não permitido: ${ext}`, {
          ip,
          endpoint: req.path,
          method: req.method,
          details: { fileName: file.originalname, extension: ext },
        })
        return res.status(400).json({
          error: `Tipo de arquivo não permitido: ${ext}. Tipos permitidos: ${allowedTypes.join(', ')}`,
        })
      }

      // Verificar tipo MIME
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        await logger.securityAlert(`Tentativa de upload com tipo MIME suspeito: ${file.mimetype}`, {
          ip,
          endpoint: req.path,
          method: req.method,
          details: { fileName: file.originalname, mimetype: file.mimetype },
        })
        return res.status(400).json({ error: 'Tipo de arquivo não permitido' })
      }

      // Verificar nome do arquivo (prevenir path traversal)
      if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
        await logger.securityAlert(`Tentativa de upload com nome de arquivo suspeito: ${file.originalname}`, {
          ip,
          endpoint: req.path,
          method: req.method,
          details: { fileName: file.originalname },
        })
        return res.status(400).json({ error: 'Nome de arquivo inválido' })
      }
    }

    next()
  }
}

/**
 * Validar upload de imagens
 */
export const validateImageUpload = validateFileUpload(ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE)

/**
 * Validar upload de documentos
 */
export const validateDocumentUpload = validateFileUpload(ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE)

