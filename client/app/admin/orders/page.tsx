'use client'

import React, { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import api from '@/lib/api'

interface Order {
  id: string
  total: number
  status: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  orderItems: Array<{
    product: {
      name: string
    }
    quantity: number
    price: number
  }>
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadOrders()
  }, [page, statusFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter && { status: statusFilter }),
      })
      const response = await api.get(`/admin/management/orders?${params}`)
      setOrders(response.data.orders)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/admin/management/orders/${orderId}/status`, { status: newStatus })
      loadOrders()
    } catch (error) {
      alert('Erro ao atualizar status do pedido')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = [
    {
      key: 'id',
      header: 'Pedido',
      render: (order: Order) => (
        <div>
          <div className="font-medium">#{order.id.slice(0, 8)}</div>
          <div className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleDateString('pt-BR')}
          </div>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Cliente',
      render: (order: Order) => (
        <div>
          <div className="font-medium">{order.user.name}</div>
          <div className="text-xs text-gray-500">{order.user.email}</div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Itens',
      render: (order: Order) => (
        <div className="text-sm">
          {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'itens'}
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (order: Order) => `R$ ${order.total.toFixed(2)}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) => (
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(order.id, e.target.value)}
          className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(order.status)} border-0`}
        >
          <option value="PENDING">Pendente</option>
          <option value="PROCESSING">Processando</option>
          <option value="SHIPPED">Enviado</option>
          <option value="DELIVERED">Entregue</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-600 mt-1">Gerencie os pedidos do sistema</p>
      </div>

      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Todos os status</option>
          <option value="PENDING">Pendente</option>
          <option value="PROCESSING">Processando</option>
          <option value="SHIPPED">Enviado</option>
          <option value="DELIVERED">Entregue</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="Nenhum pedido encontrado"
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}

