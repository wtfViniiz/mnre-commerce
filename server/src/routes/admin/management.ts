import { Router } from 'express'
import { adminAuth } from '../../middleware/adminAuth'
import {
  getProducts,
  updateProduct,
  deleteProduct,
  getUsers,
  updateUser,
  getOrders,
  updateOrderStatus,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/admin/managementController'

const router = Router()

// Produtos
router.get('/products', adminAuth, getProducts)
router.put('/products/:id', adminAuth, updateProduct)
router.delete('/products/:id', adminAuth, deleteProduct)

// Usuários
router.get('/users', adminAuth, getUsers)
router.put('/users/:id', adminAuth, updateUser)

// Pedidos
router.get('/orders', adminAuth, getOrders)
router.put('/orders/:id/status', adminAuth, updateOrderStatus)

// Categorias
router.get('/categories', adminAuth, getCategories)
router.post('/categories', adminAuth, createCategory)
router.put('/categories/:id', adminAuth, updateCategory)
router.delete('/categories/:id', adminAuth, deleteCategory)

export default router

