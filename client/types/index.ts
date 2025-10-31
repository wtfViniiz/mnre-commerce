export interface User {
  id: string
  email: string
  name: string
  role?: string
  cpf?: string
  phone?: string
  birthDate?: string
  profileCompleted?: boolean
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  categoryId: string
  category?: Category
  stock: number
  rating: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: string
  product: Product
  quantity: number
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: number
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  paymentId?: string
  address: Address
  createdAt: string
  updatedAt: string
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface Review {
  id: string
  productId: string
  userId: string
  user?: User
  rating: number
  comment?: string
  createdAt: string
}

export interface Favorite {
  id: string
  userId: string
  productId: string
  product?: Product
  createdAt: string
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export interface ProductFilters {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  search?: string
  sortBy?: 'price' | 'rating' | 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

