'use client'

import React from 'react'
import { Category } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

interface ProductFiltersProps {
  categories: Category[]
  selectedCategory?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  search?: string
  onCategoryChange: (categoryId: string) => void
  onPriceChange: (min?: number, max?: number) => void
  onRatingChange: (rating?: number) => void
  onSearchChange: (search: string) => void
  onClear: () => void
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  minRating,
  search,
  onCategoryChange,
  onPriceChange,
  onRatingChange,
  onSearchChange,
  onClear,
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Busca */}
          <div>
            <Input
              placeholder="Buscar produtos..."
              value={search || ''}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Categorias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preço */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Mínimo
              </label>
              <Input
                type="number"
                placeholder="R$ 0,00"
                value={minPrice || ''}
                onChange={(e) =>
                  onPriceChange(
                    e.target.value ? Number(e.target.value) : undefined,
                    maxPrice
                  )
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Máximo
              </label>
              <Input
                type="number"
                placeholder="R$ 999,99"
                value={maxPrice || ''}
                onChange={(e) =>
                  onPriceChange(
                    minPrice,
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating Mínimo
            </label>
            <select
              value={minRating || ''}
              onChange={(e) =>
                onRatingChange(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Qualquer rating</option>
              <option value="1">1+ ⭐</option>
              <option value="2">2+ ⭐</option>
              <option value="3">3+ ⭐</option>
              <option value="4">4+ ⭐</option>
              <option value="5">5 ⭐</option>
            </select>
          </div>

          {/* Botão Limpar */}
          <Button variant="outline" onClick={onClear} className="w-full">
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

