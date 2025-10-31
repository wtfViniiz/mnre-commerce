'use client'

import React, { useState, useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface SecurityChartProps {
  data: Array<{
    name: string
    value: number
  }>
}

const COLORS = ['#FFD200', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181']

export const SecurityChart: React.FC<SecurityChartProps> = ({ data }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

