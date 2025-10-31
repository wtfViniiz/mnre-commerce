'use client'

import React, { useEffect, useState } from 'react'
import { MetricsCard } from '@/components/admin/MetricsCard'
import { SalesChart } from '@/components/admin/Charts/SalesChart'
import { UsersChart } from '@/components/admin/Charts/UsersChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import api from '@/lib/api'
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'

interface DashboardMetrics {
  sales: {
    totalRevenue: number
    todayRevenue: number
    thisWeekRevenue: number
    avgTicket: number
  }
  orders: {
    total: number
    pending: number
    completed: number
    today: number
  }
  users: {
    total: number
    today: number
    thisWeek: number
    withOrders: number
  }
  products: {
    total: number
    inStock: number
    outOfStock: number
  }
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [salesData, setSalesData] = useState<any>(null)
  const [usersData, setUsersData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [dashboardRes, salesRes, usersRes] = await Promise.all([
          api.get('/admin/metrics/dashboard'),
          api.get('/admin/metrics/sales?period=30'),
          api.get('/admin/metrics/users?period=30'),
        ])

        setMetrics(dashboardRes.data)
        setSalesData(salesRes.data)
        setUsersData(usersRes.data)
      } catch (error) {
        console.error('Erro ao carregar métricas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <p className="text-red-600">Erro ao carregar métricas</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do sistema</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Receita Total"
          value={metrics.sales.totalRevenue}
          icon={DollarSign}
          subtitle="Desde o início"
          color="success"
          formatAsCurrency={true}
        />
        <MetricsCard
          title="Pedidos Hoje"
          value={metrics.orders.today}
          icon={ShoppingBag}
          subtitle={`${metrics.orders.pending} pendentes`}
          color="primary"
        />
        <MetricsCard
          title="Novos Usuários"
          value={metrics.users.today}
          icon={Users}
          subtitle={`${metrics.users.total} total`}
          color="warning"
        />
        <MetricsCard
          title="Produtos"
          value={metrics.products.total}
          icon={Package}
          subtitle={`${metrics.products.outOfStock} esgotados`}
          color={metrics.products.outOfStock > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas dos Últimos 30 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData?.dailySales ? (
              <SalesChart data={salesData.dailySales} />
            ) : (
              <p className="text-gray-500">Sem dados disponíveis</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {usersData?.userGrowth ? (
              <UsersChart data={usersData.userGrowth} />
            ) : (
              <p className="text-gray-500">Sem dados disponíveis</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold">{metrics.orders.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completos</span>
                <span className="font-semibold text-green-600">{metrics.orders.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pendentes</span>
                <span className="font-semibold text-yellow-600">{metrics.orders.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Hoje</span>
                <span className="font-semibold">R$ {metrics.sales.todayRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Esta Semana</span>
                <span className="font-semibold">R$ {metrics.sales.thisWeekRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ticket Médio</span>
                <span className="font-semibold">R$ {metrics.sales.avgTicket.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold">{metrics.users.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Esta Semana</span>
                <span className="font-semibold">{metrics.users.thisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Com Pedidos</span>
                <span className="font-semibold">{metrics.users.withOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

