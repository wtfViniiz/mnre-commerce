import { create } from 'zustand'
import { CartItem, Product } from '@/types'
import api from '@/lib/api'

interface CartStore {
  items: CartItem[]
  loading: boolean
  error: string | null
  fetchCart: () => Promise<void>
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        set({ items: [], loading: false })
        return
      }

      const response = await api.get('/cart')
      set({ items: response.data.items || [], loading: false })
    } catch (error: any) {
      console.error('Erro ao buscar carrinho:', error)
      set({ error: error.response?.data?.error || 'Erro ao buscar carrinho', loading: false })
    }
  },

  addItem: async (product: Product, quantity = 1) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Você precisa estar logado para adicionar itens ao carrinho')
      }

      await api.post('/cart', {
        productId: product.id,
        quantity,
      })

      await get().fetchCart()
    } catch (error: any) {
      console.error('Erro ao adicionar ao carrinho:', error)
      set({ error: error.response?.data?.error || 'Erro ao adicionar ao carrinho', loading: false })
      throw error
    }
  },

  removeItem: async (productId: string) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Você precisa estar logado')
      }

      await api.delete(`/cart/${productId}`)
      await get().fetchCart()
    } catch (error: any) {
      console.error('Erro ao remover do carrinho:', error)
      set({ error: error.response?.data?.error || 'Erro ao remover do carrinho', loading: false })
      throw error
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Você precisa estar logado')
      }

      if (quantity <= 0) {
        await get().removeItem(productId)
        return
      }

      await api.put(`/cart/${productId}`, { quantity })
      await get().fetchCart()
    } catch (error: any) {
      console.error('Erro ao atualizar quantidade:', error)
      set({ error: error.response?.data?.error || 'Erro ao atualizar quantidade', loading: false })
      throw error
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Você precisa estar logado')
      }

      await api.delete('/cart')
      set({ items: [], loading: false })
    } catch (error: any) {
      console.error('Erro ao limpar carrinho:', error)
      set({ error: error.response?.data?.error || 'Erro ao limpar carrinho', loading: false })
      throw error
    }
  },

  getTotal: () => {
    const { items } = get()
    return items.reduce((total, item) => {
      if (!item.product) return total
      return total + item.product.price * item.quantity
    }, 0)
  },

  getItemCount: () => {
    const { items } = get()
    return items.reduce((count, item) => count + item.quantity, 0)
  },
}))

