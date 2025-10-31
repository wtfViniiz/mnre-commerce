'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { Order, OrderStatus } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import api from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const { isAuthenticated, checkAuth } = useAuthStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`)
        setOrder(response.data)
      } catch (error: any) {
        console.error('Erro ao buscar pedido:', error)
        if (error.response?.status === 404) {
          setOrder(null)
        }
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId, isAuthenticated])

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'PROCESSING':
        return 'info'
      case 'SHIPPED':
        return 'info'
      case 'DELIVERED':
        return 'success'
      case 'CANCELLED':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente'
      case 'PROCESSING':
        return 'Processando'
      case 'SHIPPED':
        return 'Enviado'
      case 'DELIVERED':
        return 'Entregue'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  if (!isAuthenticated) {
    return null
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

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pedido não encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              O pedido que você procura não existe ou você não tem permissão para vê-lo.
            </p>
            <Link href="/orders">
              <Button>Voltar para Pedidos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const items = Array.isArray(order.orderItems)
    ? order.orderItems
    : Array.isArray(order.items)
    ? order.items
    : typeof order.items === 'string'
    ? JSON.parse(order.items)
    : []

  const address = typeof order.address === 'string' ? JSON.parse(order.address) : order.address

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/orders">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Voltar para Pedidos
        </Button>
      </Link>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Pedido #{order.id.slice(0, 8)}
          </h1>
          <Badge variant={getStatusColor(order.status)}>
            {getStatusLabel(order.status)}
          </Badge>
        </div>
        <p className="text-gray-600">
          Realizado em{' '}
          {new Date(order.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Itens do Pedido */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Itens do Pedido</h2>
              <div className="space-y-4">
                {items.map((item: any) => {
                  const product = item.product || {}
                  const firstImage = product.images?.[0] || '/placeholder-image.jpg'
                  const imageArray = Array.isArray(product.images)
                    ? product.images
                    : typeof product.images === 'string'
                    ? JSON.parse(product.images || '[]')
                    : []

                  return (
                    <div key={item.id || item.productId} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                      <Link href={`/products/${product.id || item.productId}`}>
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={imageArray[0] || firstImage || '/placeholder-image.jpg'}
                            alt={product.name || 'Produto'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                      <div className="flex-1">
                        <Link href={`/products/${product.id || item.productId}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                            {product.name || 'Produto'}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          Quantidade: {item.quantity}
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo e Endereço */}
        <div className="space-y-6">
          {/* Resumo */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Resumo</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span className="text-green-600 font-semibold">Grátis</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          {address && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Endereço de Entrega</h2>
                <div className="text-gray-600 space-y-1">
                  <p>
                    {address.street}, {address.number}
                    {address.complement && ` - ${address.complement}`}
                  </p>
                  <p>
                    {address.neighborhood}, {address.city} - {address.state}
                  </p>
                  <p>CEP: {address.zipCode}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagamento */}
          {order.paymentId && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">Pagamento</h2>
                <p className="text-sm text-gray-600">
                  ID: {order.paymentId}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

