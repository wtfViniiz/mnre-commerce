'use client'

import React, { useEffect } from 'react'
import { useCartStore } from '@/lib/store/cartStore'
import { useAuthStore } from '@/lib/store/authStore'
import { CartItem } from '@/components/cart/CartItem'
import { CartSummary } from '@/components/cart/CartSummary'
import { Loading } from '@/components/ui/Loading'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const { items, fetchCart, loading } = useCartStore()
  const { isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Faça login para ver seu carrinho
          </h2>
          <p className="text-gray-600 mb-6">
            Você precisa estar logado para adicionar produtos ao carrinho.
          </p>
          <Link href="/login">
            <Button>Fazer Login</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loading size="lg" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Seu carrinho está vazio
          </h2>
          <p className="text-gray-600 mb-6">
            Adicione produtos ao seu carrinho para começar a comprar.
          </p>
          <Link href="/products">
            <Button>Ver Produtos</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrinho de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}

