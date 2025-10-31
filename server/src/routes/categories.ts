import { Router } from 'express'
import { getCategories, getCategoryById } from '../controllers/categoryController'
import { Request, Response } from 'express'

const router = Router()

// Categorias são públicas (podem ser acessadas sem autenticação)
router.get('/', (req: Request, res: Response) => {
  // Converter para não requerer autenticação
  getCategories(req as any, res)
})
router.get('/:id', (req: Request, res: Response) => {
  getCategoryById(req as any, res)
})

export default router

