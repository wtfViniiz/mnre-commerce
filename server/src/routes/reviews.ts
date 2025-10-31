import { Router } from 'express'
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/product/:productId', getProductReviews)
router.post('/product/:productId', authenticate, createReview)
router.put('/:id', authenticate, updateReview)
router.delete('/:id', authenticate, deleteReview)

export default router

