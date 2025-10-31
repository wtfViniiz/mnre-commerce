'use client'

import React, { useEffect, useState } from 'react'
import { SecurityAlerts } from '@/components/admin/SecurityAlerts'
import { LogViewer } from '@/components/admin/LogViewer'
import { SecurityChart } from '@/components/admin/Charts/SecurityChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { MetricsCard } from '@/components/admin/MetricsCard'
import api from '@/lib/api'
import { Shield, AlertTriangle, Ban } from 'lucide-react'

export default function AdminSecurityPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'audit' | 'events'>('overview')

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const response = await api.get('/admin/metrics/security?period=30')
      setMetrics(response.data)
    } catch (error) {
      console.error('Erro ao carregar métricas de segurança:', error)
    }
  }

  const chartData = metrics?.eventsByType
    ? metrics.eventsByType.map((item: any) => ({
        name: item.eventType,
        value: item._count,
      }))
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Segurança</h1>
        <p className="text-gray-600 mt-1">Monitoramento e logs de segurança</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'security', label: 'Logs de Segurança' },
            { id: 'audit', label: 'Logs de Auditoria' },
            { id: 'events', label: 'Eventos de Segurança' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Cards de Métricas */}
          {metrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricsCard
                  title="Total de Eventos"
                  value={metrics.blocked?.total || 0}
                  icon={Shield}
                  color="primary"
                />
                <MetricsCard
                  title="Bloqueados"
                  value={metrics.blocked?.blocked || 0}
                  icon={Ban}
                  color="danger"
                />
                <MetricsCard
                  title="Permitidos"
                  value={metrics.blocked?.allowed || 0}
                  icon={Shield}
                  color="success"
                />
                <MetricsCard
                  title="Logins Falhos"
                  value={metrics.failedLogins || 0}
                  icon={AlertTriangle}
                  color="warning"
                />
              </div>

              {/* Gráfico */}
              <Card>
                <CardHeader>
                  <CardTitle>Eventos por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <SecurityChart data={chartData} />
                  ) : (
                    <p className="text-gray-500">Sem dados disponíveis</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Alertas em Tempo Real */}
          <SecurityAlerts />
        </div>
      )}

      {activeTab === 'security' && <LogViewer type="security" />}
      {activeTab === 'audit' && <LogViewer type="audit" />}
      {activeTab === 'events' && <LogViewer type="events" />}
    </div>
  )
}

