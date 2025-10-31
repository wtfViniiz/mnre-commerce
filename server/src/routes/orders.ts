import { Router } from 'express'
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from '../controllers/orderController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.get('/', getOrders)
router.get('/:id', getOrderById)
router.post('/', createOrder)
router.put('/:id/status', updateOrderStatus)

export default router

