import { Router } from 'express'
import { adminAuth } from '../../middleware/adminAuth'
import {
  getSecurityLogs,
  getAuditLogs,
  getSecurityEvents,
} from '../../controllers/admin/logsController'

const router = Router()

router.get('/security', adminAuth, getSecurityLogs)
router.get('/audit', adminAuth, getAuditLogs)
router.get('/events', adminAuth, getSecurityEvents)

export default router

