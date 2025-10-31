import { Router } from 'express'
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from '../controllers/favoriteController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.get('/', getFavorites)
router.post('/', addFavorite)
router.get('/check/:productId', checkFavorite)
router.delete('/:productId', removeFavorite)

export default router

