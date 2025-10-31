import { Router } from 'express'
import { adminAuth } from '../../middleware/adminAuth'
import {
  getDashboardMetrics,
  getSalesMetrics,
  getUserMetrics,
  getProductMetrics,
  getSecurityMetrics,
} from '../../controllers/admin/metricsController'

const router = Router()

router.get('/dashboard', adminAuth, getDashboardMetrics)
router.get('/sales', adminAuth, getSalesMetrics)
router.get('/users', adminAuth, getUserMetrics)
router.get('/products', adminAuth, getProductMetrics)
router.get('/security', adminAuth, getSecurityMetrics)

export default router

