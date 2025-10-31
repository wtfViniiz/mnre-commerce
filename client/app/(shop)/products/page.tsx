'use client'

import React, { useEffect, useState } from 'react'
import { useProductsStore } from '@/lib/store/productsStore'
import { ProductList } from '@/components/product/ProductList'
import { ProductFilters } from '@/components/product/ProductFilters'
import { Button } from '@/components/ui/Button'

export default function ProductsPage() {
  const {
    products,
    categories,
    loading,
    filters,
    pagination,
    fetchProducts,
    fetchCategories,
    setFilters,
    clearFilters,
  } = useProductsStore()

  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout>()

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  useEffect(() => {
    // Debounce da busca
    if (searchDebounce) {
      clearTimeout(searchDebounce)
    }

    const timeout = setTimeout(() => {
      fetchProducts()
    }, 500)

    setSearchDebounce(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [filters])

  const handleCategoryChange = (categoryId: string) => {
    setFilters({
      categoryId: categoryId || undefined,
      page: 1,
    })
  }

  const handlePriceChange = (min?: number, max?: number) => {
    setFilters({
      minPrice: min,
      maxPrice: max,
      page: 1,
    })
  }

  const handleRatingChange = (rating?: number) => {
    setFilters({
      minRating: rating,
      page: 1,
    })
  }

  const handleSearchChange = (search: string) => {
    setFilters({
      search: search || undefined,
      page: 1,
    })
  }

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters({
      sortBy: sortBy as any,
      sortOrder,
    })
  }

  const handlePageChange = (page: number) => {
    setFilters({ page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Produtos</h1>
        <p className="text-gray-600">
          Encontre os melhores produtos para você
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtros */}
        <div className="lg:col-span-1">
          <ProductFilters
            categories={categories}
            selectedCategory={filters.categoryId}
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            minRating={filters.minRating}
            search={filters.search}
            onCategoryChange={handleCategoryChange}
            onPriceChange={handlePriceChange}
            onRatingChange={handleRatingChange}
            onSearchChange={handleSearchChange}
            onClear={clearFilters}
          />
        </div>

        {/* Lista de Produtos */}
        <div className="lg:col-span-3">
          {/* Ordenação */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              {pagination.total} produto(s) encontrado(s)
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Ordenar por:</span>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  handleSortChange(sortBy, sortOrder as 'asc' | 'desc')
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="createdAt-desc">Mais recentes</option>
                <option value="createdAt-asc">Mais antigos</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="rating-desc">Melhor avaliação</option>
                <option value="name-asc">Nome A-Z</option>
                <option value="name-desc">Nome Z-A</option>
              </select>
            </div>
          </div>

          <ProductList products={products} loading={loading} />

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

