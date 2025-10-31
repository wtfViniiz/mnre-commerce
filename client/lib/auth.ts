import { getSession } from 'next-auth/react'
import api from './api'

export interface RegisterData {
  email: string
  name: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export const register = async (data: RegisterData) => {
  try {
    const response = await api.post('/auth/register', data)
    
    if (response.data.token && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token)
    }
    
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erro ao registrar')
  }
}

export const login = async (data: LoginData) => {
  try {
    const response = await api.post('/auth/login', data)
    
    if (response.data.token && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token)
    }
    
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erro ao fazer login')
  }
}

export const logout = async () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
  }
  // NextAuth logout será chamado pelo componente
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

