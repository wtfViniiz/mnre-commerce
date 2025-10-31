import axios from 'axios'
import { getCSRFToken } from './csrf'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação e CSRF
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Adicionar CSRF token para métodos que modificam dados
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
      const csrfToken = await getCSRFToken()
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken
      }
    }
  }
  return config
})

// Interceptor para renovar token quando expirar
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Se erro 401 e não é retry, tentar renovar token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          })

          const { token, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('token', token)
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken)
          }

          // Tentar requisição original novamente
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Se refresh falhar, limpar tokens e redirecionar para login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api

