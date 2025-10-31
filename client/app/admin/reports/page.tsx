'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import api from '@/lib/api'
import { Download, FileText } from 'lucide-react'

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  })

  const exportReport = async (type: 'sales' | 'users' | 'products' | 'security', format: 'csv' | 'json') => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (dateRange.start) params.append('startDate', dateRange.start)
      if (dateRange.end) params.append('endDate', dateRange.end)

      let endpoint = ''
      if (type === 'sales') {
        endpoint = '/admin/metrics/sales'
      } else if (type === 'users') {
        endpoint = '/admin/metrics/users'
      } else if (type === 'products') {
        endpoint = '/admin/metrics/products'
      } else {
        endpoint = '/admin/metrics/security'
      }

      const response = await api.get(`${endpoint}?${params}`)
      const data = response.data

      if (format === 'csv') {
        exportToCSV(data, type)
      } else {
        exportToJSON(data, type)
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      alert('Erro ao exportar relatório')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = (data: any, type: string) => {
    let csv = ''
    
    if (type === 'sales' && data.dailySales) {
      csv = 'Data,Receita,Pedidos\n'
      data.dailySales.forEach((item: any) => {
        csv += `${item.date},${item.total},${item.count}\n`
      })
    } else if (type === 'users' && data.userGrowth) {
      csv = 'Data,Novos Usuários\n'
      data.userGrowth.forEach((item: any) => {
        csv += `${item.date},${item.count}\n`
      })
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportToJSON = (data: any, type: string) => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const exportLogs = async (logType: 'security' | 'audit' | 'events', format: 'csv' | 'json') => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (dateRange.start) params.append('startDate', dateRange.start)
      if (dateRange.end) params.append('endDate', dateRange.end)
      params.append('limit', '10000')

      let endpoint = ''
      if (logType === 'security') {
        endpoint = '/admin/logs/security'
      } else if (logType === 'audit') {
        endpoint = '/admin/logs/audit'
      } else {
        endpoint = '/admin/logs/events'
      }

      const response = await api.get(`${endpoint}?${params}`)
      const logs = response.data.logs || response.data.events || []

      if (format === 'csv') {
        let csv = 'Data,Nível,Mensagem,IP,Endpoint,Status\n'
        logs.forEach((log: any) => {
          csv += `${log.createdAt},${log.level || log.severity},${log.message || log.description},${log.ip || ''},${log.endpoint || ''},${log.statusCode || ''}\n`
        })
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `logs-${logType}-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
      } else {
        const json = JSON.stringify(logs, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `logs-${logType}-${new Date().toISOString().split('T')[0]}.json`
        link.click()
      }
    } catch (error) {
      console.error('Erro ao exportar logs:', error)
      alert('Erro ao exportar logs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600 mt-1">Exporte relatórios e logs do sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Data Inicial"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <Input
              type="date"
              label="Data Final"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relatórios de Métricas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: 'sales', label: 'Vendas' },
              { type: 'users', label: 'Usuários' },
              { type: 'products', label: 'Produtos' },
              { type: 'security', label: 'Segurança' },
            ].map((report) => (
              <div key={report.type} className="space-y-2">
                <h3 className="font-semibold">{report.label}</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportReport(report.type as any, 'csv')}
                    disabled={loading}
                  >
                    <Download size={16} className="mr-1" />
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportReport(report.type as any, 'json')}
                    disabled={loading}
                  >
                    <FileText size={16} className="mr-1" />
                    JSON
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exportação de Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: 'security', label: 'Logs de Segurança' },
              { type: 'audit', label: 'Logs de Auditoria' },
              { type: 'events', label: 'Eventos de Segurança' },
            ].map((log) => (
              <div key={log.type} className="space-y-2">
                <h3 className="font-semibold">{log.label}</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportLogs(log.type as any, 'csv')}
                    disabled={loading}
                  >
                    <Download size={16} className="mr-1" />
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportLogs(log.type as any, 'json')}
                    disabled={loading}
                  >
                    <FileText size={16} className="mr-1" />
                    JSON
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

