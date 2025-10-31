import { create } from 'zustand'
import { User } from '@/types'
import { login, register, logout as logoutAPI, getAuthToken } from '@/lib/auth'
import { signIn, signOut, getSession } from 'next-auth/react'
import api from '@/lib/api'

interface AuthStore {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      // Fazer login direto pela API para obter o token imediatamente
      const loginResponse = await api.post('/auth/login', {
        email,
        password,
      })

      if (!loginResponse.data?.token || !loginResponse.data?.user) {
        throw new Error('Resposta de login inválida')
      }

      // Salvar tokens no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', loginResponse.data.token)
        if (loginResponse.data.refreshToken) {
          localStorage.setItem('refreshToken', loginResponse.data.refreshToken)
        }
      }

      // Usar NextAuth para manter a sessão sincronizada (opcional, mas útil)
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      // Usar os dados do login direto (já temos o token salvo)
      set({
        user: {
          id: loginResponse.data.user.id,
          email: loginResponse.data.user.email,
          name: loginResponse.data.user.name,
          role: loginResponse.data.user.role || 'USER',
          cpf: loginResponse.data.user.cpf,
          phone: loginResponse.data.user.phone,
          birthDate: loginResponse.data.user.birthDate,
          profileCompleted: loginResponse.data.user.profileCompleted,
          createdAt: loginResponse.data.user.createdAt || new Date().toISOString(),
        },
        isAuthenticated: true,
        loading: false,
      })
    } catch (error: any) {
      console.error('Erro no login:', error)
      set({
        error: error.response?.data?.error || error.message || 'Erro ao fazer login',
        loading: false,
        isAuthenticated: false,
      })
      throw error
    }
  },

  register: async (email: string, name: string, password: string) => {
    set({ loading: true, error: null })
    try {
      // Fazer registro direto pela API
      const registerResponse = await api.post('/auth/register', {
        email,
        name,
        password,
      })

      if (!registerResponse.data?.token || !registerResponse.data?.user) {
        throw new Error('Resposta de registro inválida')
      }

      // Salvar tokens no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', registerResponse.data.token)
        if (registerResponse.data.refreshToken) {
          localStorage.setItem('refreshToken', registerResponse.data.refreshToken)
        }
      }

      // Usar NextAuth para manter a sessão sincronizada
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      set({
        user: {
          id: registerResponse.data.user.id,
          email: registerResponse.data.user.email,
          name: registerResponse.data.user.name,
          role: registerResponse.data.user.role || 'USER',
          cpf: registerResponse.data.user.cpf,
          phone: registerResponse.data.user.phone,
          birthDate: registerResponse.data.user.birthDate,
          profileCompleted: registerResponse.data.user.profileCompleted,
          createdAt: registerResponse.data.user.createdAt || new Date().toISOString(),
        },
        isAuthenticated: true,
        loading: false,
      })
    } catch (error: any) {
      console.error('Erro no registro:', error)
      set({
        error: error.response?.data?.error || error.message || 'Erro ao registrar',
        loading: false,
        isAuthenticated: false,
      })
      throw error
    }
  },

  logout: async () => {
    set({ loading: true })
    try {
      await logoutAPI()
      await signOut({ redirect: false })
      
      // Limpar tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      }
      
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      })
    } catch (error: any) {
      console.error('Erro no logout:', error)
      set({ error: error.message || 'Erro ao fazer logout', loading: false })
    }
  },

  checkAuth: async () => {
    const currentState = useAuthStore.getState()
    
    // Se já está autenticado e tem token, tentar atualizar, mas não limpar se falhar
    const token = getAuthToken()
    if (!token) {
      set({ user: null, isAuthenticated: false, loading: false })
      return
    }

    set({ loading: true })
    try {
      // Buscar dados atualizados do usuário
      const response = await api.get('/auth/me')
      if (response.data?.user) {
          set({
            user: {
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.name,
              role: response.data.user.role || 'USER',
              cpf: response.data.user.cpf,
              phone: response.data.user.phone,
              birthDate: response.data.user.birthDate,
              profileCompleted: response.data.user.profileCompleted,
              createdAt: response.data.user.createdAt || new Date().toISOString(),
            },
            isAuthenticated: true,
            loading: false,
          })
      } else {
        // Token inválido ou expirado - limpar
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
        set({ user: null, isAuthenticated: false, loading: false })
      }
    } catch (error: any) {
      // Se for 401 (não autorizado), tentar renovar com refresh token
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken')
          
          if (refreshToken) {
            try {
              // Tentar renovar token
              const refreshResponse = await api.post('/auth/refresh', { refreshToken })
              if (refreshResponse.data?.token) {
                localStorage.setItem('token', refreshResponse.data.token)
                if (refreshResponse.data.refreshToken) {
                  localStorage.setItem('refreshToken', refreshResponse.data.refreshToken)
                }
                // Tentar novamente buscar /me
                const meResponse = await api.get('/auth/me')
                if (meResponse.data?.user) {
                  set({
                    user: {
                      id: meResponse.data.user.id,
                      email: meResponse.data.user.email,
                      name: meResponse.data.user.name,
                      role: meResponse.data.user.role || 'USER',
                      cpf: meResponse.data.user.cpf,
                      phone: meResponse.data.user.phone,
                      birthDate: meResponse.data.user.birthDate,
                      profileCompleted: meResponse.data.user.profileCompleted,
                      createdAt: meResponse.data.user.createdAt || new Date().toISOString(),
                    },
                    isAuthenticated: true,
                    loading: false,
                  })
                  return
                }
              }
            } catch (refreshError) {
              // Se refresh falhar, limpar tudo
              localStorage.removeItem('token')
              localStorage.removeItem('refreshToken')
            }
          } else {
            localStorage.removeItem('token')
          }
        }
        set({ user: null, isAuthenticated: false, loading: false })
      } else {
        // Para outros erros (rede, etc), manter o estado atual se já estava autenticado
        console.error('Erro ao verificar autenticação:', error)
        if (currentState.isAuthenticated && currentState.user) {
          // Manter o estado atual em caso de erro de rede
          set({ loading: false })
        } else {
          // Se não estava autenticado, limpar
          set({ user: null, isAuthenticated: false, loading: false })
        }
      }
    }
  },
}))

