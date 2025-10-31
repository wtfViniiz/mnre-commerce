'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CartItem as CartItemType } from '@/types'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/lib/store/cartStore'
import { Trash2, Plus, Minus } from 'lucide-react'

interface CartItemProps {
  item: CartItemType
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore()
  const [isUpdating, setIsUpdating] = React.useState(false)

  if (!item.product) {
    return null
  }

  const firstImage = item.product.images?.[0] || '/placeholder-image.jpg'
  const subtotal = item.product.price * item.quantity

  const handleUpdateQuantity = async (newQuantity: number) => {
    setIsUpdating(true)
    try {
      await updateQuantity(item.productId, newQuantity)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    setIsUpdating(true)
    try {
      await removeItem(item.productId)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
      <Link href={`/products/${item.product.id}`}>
        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={firstImage}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.product.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
            {item.product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500">
          {item.product.category?.name}
        </p>
        <p className="text-lg font-bold text-gray-900 mt-1">
          R$ {item.product.price.toFixed(2).replace('.', ',')}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdateQuantity(item.quantity - 1)}
          disabled={isUpdating || item.quantity <= 1}
        >
          <Minus size={16} />
        </Button>
        <span className="w-12 text-center font-medium">{item.quantity}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdateQuantity(item.quantity + 1)}
          disabled={isUpdating || item.quantity >= item.product.stock}
        >
          <Plus size={16} />
        </Button>
      </div>

      <div className="text-right min-w-[100px]">
        <p className="text-lg font-bold text-gray-900">
          R$ {subtotal.toFixed(2).replace('.', ',')}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isUpdating}
          className="mt-2 text-red-600 hover:text-red-700"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  )
}

