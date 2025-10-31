'use client'

import React from 'react'
import { useCartStore } from '@/lib/store/cartStore'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export const CartSummary: React.FC = () => {
  const { items, getTotal } = useCartStore()

  const subtotal = getTotal()
  const shipping = subtotal > 200 ? 0 : 15
  const total = subtotal + shipping

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Frete</span>
            <span>
              {shipping === 0 ? (
                <span className="text-green-600 font-semibold">Grátis</span>
              ) : (
                `R$ ${shipping.toFixed(2).replace('.', ',')}`
              )}
            </span>
          </div>
          {subtotal < 200 && (
            <p className="text-sm text-gray-500">
              Faltam R$ {(200 - subtotal).toFixed(2).replace('.', ',')} para frete grátis
            </p>
          )}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>

        <Link href="/checkout" className="block">
          <Button className="w-full" size="lg">
            <ShoppingBag size={20} className="mr-2" />
            Finalizar Compra
          </Button>
        </Link>

        <Link href="/products" className="block mt-4">
          <Button variant="outline" className="w-full">
            Continuar Comprando
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

