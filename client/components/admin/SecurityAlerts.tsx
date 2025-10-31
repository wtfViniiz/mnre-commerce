'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import api from '@/lib/api'
import { AlertTriangle, Shield, Ban, Activity } from 'lucide-react'

interface SecurityEvent {
  id: string
  eventType: string
  severity: string
  ip: string
  endpoint: string
  method: string
  blocked: boolean
  description: string
  createdAt: string
}

export const SecurityAlerts: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentEvents()
    const interval = setInterval(loadRecentEvents, 30000) // Atualizar a cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  const loadRecentEvents = async () => {
    try {
      const response = await api.get('/admin/logs/events?limit=10')
      setEvents(response.data.events || [])
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SQL_INJECTION: 'SQL Injection',
      XSS: 'Cross-Site Scripting',
      BRUTE_FORCE: 'Força Bruta',
      SUSPICIOUS_REQUEST: 'Requisição Suspeita',
    }
    return labels[type] || type
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield size={20} />
          Alertas de Segurança em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-gray-500 py-8">Carregando...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Activity size={48} className="mx-auto mb-2 text-gray-400" />
            <p>Nenhum evento de segurança recente</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.id}
                className={`p-4 border-l-4 rounded ${getSeverityColor(event.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span className="font-semibold">{getEventTypeLabel(event.eventType)}</span>
                    <Badge className={getSeverityColor(event.severity)}>{event.severity}</Badge>
                    {event.blocked && (
                      <Badge className="bg-red-500 text-white">BLOQUEADO</Badge>
                    )}
                  </div>
                  <span className="text-xs opacity-75">
                    {new Date(event.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm mb-1">{event.description}</p>
                <div className="text-xs opacity-75 mt-1">
                  IP: {event.ip} | {event.method} {event.endpoint}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

