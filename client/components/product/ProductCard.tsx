'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/lib/store/cartStore'
import { Heart, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
  onFavoriteToggle?: () => void
  isFavorite?: boolean
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onFavoriteToggle,
  isFavorite = false,
}) => {
  const { addItem } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      await addItem(product, 1)
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const firstImage = product.images?.[0] || '/placeholder-image.jpg'

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <Link href={`/products/${product.id}`}>
        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
          <Image
            src={firstImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Esgotado</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          {onFavoriteToggle && (
            <button
              onClick={onFavoriteToggle}
              className={`ml-2 p-1 transition-colors ${
                isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {product.category && (
          <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-bold text-gray-900">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          {product.rating > 0 && (
            <div className="flex items-center gap-1 text-yellow-500">
              <span className="text-sm">⭐</span>
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || isAdding}
          isLoading={isAdding}
          className="w-full"
          size="sm"
        >
          <ShoppingCart size={16} className="mr-2" />
          Adicionar ao Carrinho
        </Button>
      </div>
    </Card>
  )
}

