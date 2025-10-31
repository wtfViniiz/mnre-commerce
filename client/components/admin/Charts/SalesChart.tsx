'use client'

import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface SalesChartProps {
  data: Array<{
    date: string
    total: number
    count: number
  }>
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
    receita: item.total,
    pedidos: item.count,
  }))

  if (!mounted || !data || data.length === 0) {
    return (
      <div className="w-full h-[400px] min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500">Carregando gráfico...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[400px] min-h-[400px]">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'receita') {
                return [`R$ ${value.toFixed(2)}`, 'Receita']
              }
              return [value, 'Pedidos']
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="receita"
            stroke="#FFD200"
            strokeWidth={2}
            name="Receita"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="pedidos"
            stroke="#8884d8"
            strokeWidth={2}
            name="Pedidos"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

