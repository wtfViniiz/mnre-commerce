import { Router } from 'express'
import { register, login, getMe, updateProfile, refreshToken } from '../controllers/authController'
import { authenticate } from '../middleware/auth'
import { timingAttackProtection } from '../middleware/timingAttack'
import { generateCSRFToken } from '../middleware/csrf'

const router = Router()

// Endpoint para obter CSRF token (público para usuários autenticados)
router.get('/csrf-token', authenticate, (req: any, res) => {
  const userId = req.userId || 'anonymous'
  const token = generateCSRFToken(userId)
  res.json({ token })
})

// Proteção contra timing attacks em endpoints sensíveis
router.post('/login', timingAttackProtection, login)
router.post('/register', timingAttackProtection, register)
router.post('/refresh', refreshToken)
router.get('/me', authenticate, getMe)
router.put('/profile', authenticate, updateProfile)

export default router

