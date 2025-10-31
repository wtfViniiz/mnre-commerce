import { Router } from 'express'
import metricsRoutes from './metrics'
import managementRoutes from './management'
import logsRoutes from './logs'

const router = Router()

router.use('/metrics', metricsRoutes)
router.use('/management', managementRoutes)
router.use('/logs', logsRoutes)

export default router

