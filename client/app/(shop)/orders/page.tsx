'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { Order, OrderStatus } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import api from '@/lib/api'
import Link from 'next/link'
import { Package, ArrowRight } from 'lucide-react'

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated, checkAuth } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders')
        setOrders(response.data)
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated])

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhum pedido encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              Você ainda não fez nenhum pedido.
            </p>
            <Link href="/products">
              <Button>Ver Produtos</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = Array.isArray(order.items)
              ? order.items
              : typeof order.items === 'string'
              ? JSON.parse(order.items)
              : []

            return (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Pedido #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {items.length} item(s) no pedido
                    </p>
                    <ul className="space-y-1">
                      {items.slice(0, 3).map((item: any, index: number) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {item.product?.name || 'Produto'} x {item.quantity}
                        </li>
                      ))}
                      {items.length > 3 && (
                        <li className="text-sm text-gray-500">
                          +{items.length - 3} mais item(s)
                        </li>
                      )}
                    </ul>
                  </div>

                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" className="w-full">
                      Ver Detalhes
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

