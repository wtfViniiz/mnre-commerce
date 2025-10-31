'use client'

import React from 'react'
import { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { Loading } from '@/components/ui/Loading'

interface ProductListProps {
  products: Product[]
  loading?: boolean
  onFavoriteToggle?: (productId: string) => void
  favorites?: Set<string>
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  onFavoriteToggle,
  favorites,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading size="lg" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isFavorite={favorites?.has(product.id)}
          onFavoriteToggle={
            onFavoriteToggle ? () => onFavoriteToggle(product.id) : undefined
          }
        />
      ))}
    </div>
  )
}

