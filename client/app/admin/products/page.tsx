'use client'

import React, { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import api from '@/lib/api'
import { Search, Edit, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: {
    name: string
  }
  _count: {
    reviews: number
    favorites: number
    orderItems: number
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadProducts()
  }, [page, search])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
      })
      const response = await api.get(`/admin/management/products?${params}`)
      setProducts(response.data.products)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return

    try {
      await api.delete(`/admin/management/products/${id}`)
      loadProducts()
    } catch (error) {
      alert('Erro ao deletar produto')
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      render: (product: Product) => (
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-xs text-gray-500">{product.category.name}</div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Preço',
      render: (product: Product) => `R$ ${product.price.toFixed(2)}`,
    },
    {
      key: 'stock',
      header: 'Estoque',
      render: (product: Product) => (
        <span className={product.stock === 0 ? 'text-red-600 font-semibold' : ''}>
          {product.stock}
        </span>
      ),
    },
    {
      key: 'stats',
      header: 'Estatísticas',
      render: (product: Product) => (
        <div className="text-xs text-gray-500">
          {product._count.orderItems} vendas | {product._count.reviews} reviews | {product._count.favorites} favoritos
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (product: Product) => (
        <div className="flex gap-2">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="p-1 text-primary-600 hover:bg-primary-50 rounded"
          >
            <Edit size={16} />
          </Link>
          <Link
            href={`/products/${product.id}`}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            target="_blank"
          >
            <span className="text-xs">Ver</span>
          </Link>
          <button
            onClick={() => handleDelete(product.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-1">Gerencie seus produtos</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus size={20} className="mr-2" />
            Novo Produto
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="Nenhum produto encontrado"
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}

