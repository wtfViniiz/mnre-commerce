'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { LucideIcon } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'primary' | 'success' | 'warning' | 'danger'
  formatAsCurrency?: boolean
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = 'primary',
  formatAsCurrency = false,
}) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
  }

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (formatAsCurrency) {
        if (val >= 1000000) {
          return `R$ ${(val / 1000000).toFixed(2)}M`
        }
        if (val >= 1000) {
          return `R$ ${(val / 1000).toFixed(2)}k`
        }
        return `R$ ${val.toFixed(2)}`
      } else {
        // Formatação numérica simples
        return val.toLocaleString('pt-BR')
      }
    }
    return val
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{formatValue(value)}</p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon size={24} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

