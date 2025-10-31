'use client'

import React, { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import api from '@/lib/api'
import { Badge } from '@/components/ui/Badge'

interface SecurityLog {
  id: string
  level: string
  message: string
  ip?: string
  endpoint?: string
  method?: string
  statusCode?: number
  createdAt: string
}

interface LogViewerProps {
  type: 'security' | 'audit' | 'events'
}

export const LogViewer: React.FC<LogViewerProps> = ({ type }) => {
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    level: '',
    ip: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    loadLogs()
  }, [page, filters, type])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filters.level && { level: filters.level }),
        ...(filters.ip && { ip: filters.ip }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      })

      let endpoint = ''
      if (type === 'security') {
        endpoint = '/admin/logs/security'
      } else if (type === 'audit') {
        endpoint = '/admin/logs/audit'
      } else {
        endpoint = '/admin/logs/events'
      }

      const response = await api.get(`${endpoint}?${params}`)
      const data = response.data.logs || response.data.events || []
      // Converter eventos para formato de log (se necessário)
      const formattedData = Array.isArray(data)
        ? data.map((item: any) => ({
            ...item,
            level: item.level || item.severity || 'INFO',
            message: item.message || item.description || '',
          }))
        : []
      setLogs(formattedData)
      setTotalPages(response.data.pagination?.pages || 1)
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'SECURITY_ALERT':
      case 'ERROR':
        return 'bg-red-100 text-red-800'
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const columns = [
    {
      key: 'createdAt',
      header: 'Data/Hora',
      render: (log: SecurityLog) => (
        <div className="text-sm">
          {new Date(log.createdAt).toLocaleString('pt-BR')}
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Nível',
      render: (log: SecurityLog) => (
        <Badge className={getLevelColor(log.level || 'INFO')}>{log.level || log.severity || 'INFO'}</Badge>
      ),
    },
    {
      key: 'message',
      header: 'Mensagem',
      render: (log: SecurityLog) => <div className="text-sm">{log.message || log.description || ''}</div>,
    },
    {
      key: 'ip',
      header: 'IP',
      render: (log: SecurityLog) => log.ip || '-',
    },
    {
      key: 'endpoint',
      header: 'Endpoint',
      render: (log: SecurityLog) => (
        <div className="text-xs">
          {log.method} {log.endpoint || '-'}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Nível..."
          value={filters.level}
          onChange={(e) => {
            setFilters({ ...filters, level: e.target.value })
            setPage(1)
          }}
        />
        <Input
          placeholder="IP..."
          value={filters.ip}
          onChange={(e) => {
            setFilters({ ...filters, ip: e.target.value })
            setPage(1)
          }}
        />
        <Input
          type="date"
          placeholder="Data inicial..."
          value={filters.startDate}
          onChange={(e) => {
            setFilters({ ...filters, startDate: e.target.value })
            setPage(1)
          }}
        />
        <Input
          type="date"
          placeholder="Data final..."
          value={filters.endDate}
          onChange={(e) => {
            setFilters({ ...filters, endDate: e.target.value })
            setPage(1)
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        emptyMessage="Nenhum log encontrado"
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="flex items-center px-4">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}

