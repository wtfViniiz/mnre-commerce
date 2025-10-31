import { Request, Response, NextFunction } from 'express'
import { body, param, query, validationResult } from 'express-validator'

// Validador de senha forte
export const validatePassword = body('password')
  .isLength({ min: 8 })
  .withMessage('A senha deve ter no mínimo 8 caracteres')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('A senha deve conter pelo menos: 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial')

// Validador de email
export const validateEmail = body('email')
  .isEmail()
  .withMessage('Email inválido')
  .normalizeEmail()

// Validador de nome
export const validateName = body('name')
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('Nome deve ter entre 2 e 100 caracteres')
  .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
  .withMessage('Nome deve conter apenas letras')

// Validador de ID
export const validateId = param('id')
  .isLength({ min: 1, max: 100 })
  .withMessage('ID inválido')

// Validador de preço
export const validatePrice = body('price')
  .isFloat({ min: 0.01 })
  .withMessage('Preço deve ser um número positivo')

// Validador de quantidade
export const validateQuantity = body('quantity')
  .isInt({ min: 1 })
  .withMessage('Quantidade deve ser um número inteiro positivo')

// Sanitização básica de strings
export const sanitizeString = (value: string): string => {
  if (typeof value !== 'string') return value
  
  return value
    .trim()
    .replace(/[<>]/g, '') // Remover < e >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .substring(0, 10000) // Limitar tamanho
}

// Middleware para sanitizar inputs
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  // Sanitizar query params
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string)
      }
    }
  }

  // Sanitizar body params (exceto senhas e campos que não devem ser sanitizados)
  if (req.body) {
    const sensitiveFields = ['password', 'token', 'paymentId', 'accessToken']
    for (const key in req.body) {
      if (!sensitiveFields.includes(key) && typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key])
      }
    }
  }

  next()
}

// Middleware para verificar resultados da validação
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Erro de validação',
      details: errors.array(),
    })
  }
  next()
}

