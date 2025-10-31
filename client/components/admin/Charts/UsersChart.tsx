'use client'

import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface UsersChartProps {
  data: Array<{
    date: string
    count: number
  }>
}

export const UsersChart: React.FC<UsersChartProps> = ({ data }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
    usuarios: item.count,
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
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="usuarios" fill="#FFD200" name="Novos Usuários" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

