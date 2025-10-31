import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import cartRoutes from './routes/cart'
import categoryRoutes from './routes/categories'
import orderRoutes from './routes/orders'
import reviewRoutes from './routes/reviews'
import favoriteRoutes from './routes/favorites'
import paymentRoutes from './routes/payment'
import adminRoutes from './routes/admin'
import { rateLimiter } from './middleware/rateLimiter'
import { endpointRateLimiter } from './middleware/endpointRateLimiter'
import { securityDetector } from './middleware/securityDetector'
import { securityHeaders, additionalSecurity } from './middleware/securityHeaders'
import { sanitizeInputs } from './middleware/inputValidation'
import { logger } from './services/logger'

const app = express()
const PORT = process.env.PORT || 5000

// HTTPS Enforcement (primeiro, se em produção)
if (process.env.NODE_ENV === 'production') {
  const { httpsEnforcement } = require('./middleware/httpsEnforcement')
  app.use(httpsEnforcement)
}

// Security Headers (primeiro!)
app.use(securityHeaders)
app.use(additionalSecurity)

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
}))
app.use(express.json({ limit: '10mb' })) // Limitar tamanho do body

// Sanitização de inputs
app.use(sanitizeInputs)

// Rate limiting global
app.use(rateLimiter)

// Rate limiting específico por endpoint
app.use(endpointRateLimiter)

// Security detector (antes das rotas)
app.use((req, res, next) => {
  // Pular security detector apenas para health check
  if (req.path === '/health') {
    return next()
  }
  securityDetector(req, res, next)
})

// Logging de requisições
app.use(async (req, res, next) => {
  const start = Date.now()
  
  // Capturar IP
  const ip = 
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'

  // Interceptar resposta para logar status
  const originalSend = res.send
  res.send = function (body: any) {
    const duration = Date.now() - start
    logger.info(`${req.method} ${req.path} - ${res.statusCode}`, {
      ip,
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      userAgent: req.headers['user-agent'],
      duration,
    })
    return originalSend.call(this, body)
  }

  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/payment', paymentRoutes)

// Admin routes
app.use('/api/admin', adminRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app
