import { create } from 'zustand'
import { Product, ProductFilters, Category } from '@/types'
import api from '@/lib/api'

interface ProductsStore {
  products: Product[]
  categories: Category[]
  loading: boolean
  error: string | null
  filters: ProductFilters
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  fetchProducts: (filters?: ProductFilters) => Promise<void>
  fetchProductById: (id: string) => Promise<Product | null>
  fetchCategories: () => Promise<void>
  setFilters: (filters: Partial<ProductFilters>) => void
  clearFilters: () => void
}

const defaultFilters: ProductFilters = {
  page: 1,
  limit: 12,
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

export const useProductsStore = create<ProductsStore>((set, get) => ({
  products: [],
  categories: [],
  loading: false,
  error: null,
  filters: defaultFilters,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },

  fetchProducts: async (filters) => {
    set({ loading: true, error: null })
    try {
      const currentFilters = filters || get().filters
      const params = new URLSearchParams()

      if (currentFilters.categoryId) {
        params.append('categoryId', currentFilters.categoryId)
      }
      if (currentFilters.minPrice) {
        params.append('minPrice', currentFilters.minPrice.toString())
      }
      if (currentFilters.maxPrice) {
        params.append('maxPrice', currentFilters.maxPrice.toString())
      }
      if (currentFilters.minRating) {
        params.append('minRating', currentFilters.minRating.toString())
      }
      if (currentFilters.search) {
        params.append('search', currentFilters.search)
      }
      if (currentFilters.sortBy) {
        params.append('sortBy', currentFilters.sortBy)
      }
      if (currentFilters.sortOrder) {
        params.append('sortOrder', currentFilters.sortOrder)
      }
      if (currentFilters.page) {
        params.append('page', currentFilters.page.toString())
      }
      if (currentFilters.limit) {
        params.append('limit', currentFilters.limit.toString())
      }

      const response = await api.get(`/products?${params.toString()}`)
      
      set({
        products: response.data.products || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
        },
        loading: false,
      })
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error)
      set({
        error: error.response?.data?.error || 'Erro ao buscar produtos',
        loading: false,
      })
    }
  },

  fetchProductById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const response = await api.get(`/products/${id}`)
      const product = response.data

      // Parse images
      if (typeof product.images === 'string') {
        product.images = JSON.parse(product.images)
      }

      set({ loading: false })
      return product
    } catch (error: any) {
      console.error('Erro ao buscar produto:', error)
      set({
        error: error.response?.data?.error || 'Erro ao buscar produto',
        loading: false,
      })
      return null
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/categories')
      set({
        categories: response.data || [],
        loading: false,
      })
    } catch (error: any) {
      console.error('Erro ao buscar categorias:', error)
      set({
        error: error.response?.data?.error || 'Erro ao buscar categorias',
        loading: false,
      })
    }
  },

  setFilters: (newFilters: Partial<ProductFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
  },

  clearFilters: () => {
    set({ filters: defaultFilters })
  },
}))

