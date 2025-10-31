import { Router } from 'express'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.get('/', getCart)
router.post('/', addToCart)
router.put('/:productId', updateCartItem)
router.delete('/:productId', removeFromCart)
router.delete('/', clearCart)

export default router

