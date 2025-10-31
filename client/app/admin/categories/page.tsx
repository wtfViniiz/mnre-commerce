'use client'

import React, { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import api from '@/lib/api'
import { Plus, Trash2, Edit, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
  parent?: Category
  _count: {
    products: number
  }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parentId: '',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/management/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!formData.name.trim()) {
      alert('Por favor, preencha o nome da categoria')
      return
    }

    if (!formData.slug.trim()) {
      alert('Por favor, preencha o slug da categoria')
      return
    }

    try {
      if (editingCategory) {
        await api.put(`/admin/management/categories/${editingCategory.id}`, {
          ...formData,
          parentId: formData.parentId || undefined,
        })
        alert('Categoria atualizada com sucesso!')
      } else {
        await api.post('/admin/management/categories', {
          ...formData,
          parentId: formData.parentId || undefined,
        })
        alert('Categoria criada com sucesso!')
      }
      setShowForm(false)
      setEditingCategory(null)
      setFormData({ name: '', slug: '', parentId: '' })
      loadCategories()
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error)
      alert(error.response?.data?.error || 'Erro ao salvar categoria')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) return

    try {
      await api.delete(`/admin/management/categories/${id}`)
      loadCategories()
    } catch (error) {
      alert('Erro ao deletar categoria')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || '',
    })
    setShowForm(true)
  }

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      render: (category: Category) => (
        <div>
          <div className="font-medium">{category.name}</div>
          <div className="text-xs text-gray-500">/{category.slug}</div>
        </div>
      ),
    },
    {
      key: 'parent',
      header: 'Categoria Pai',
      render: (category: Category) => category.parent?.name || '-',
    },
    {
      key: 'products',
      header: 'Produtos',
      render: (category: Category) => category._count.products,
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (category: Category) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(category)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(category.id)}
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
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600 mt-1">Gerencie as categorias de produtos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          Nova Categoria
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </CardTitle>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingCategory(null)
                setFormData({ name: '', slug: '', parentId: '' })
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Categoria *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value
                    // Gerar slug automaticamente a partir do nome
                    const slug = name
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '')
                    setFormData({ ...formData, name, slug })
                  }}
                  placeholder="Ex: Camisetas"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  O slug será gerado automaticamente
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Ex: camisetas"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL amigável (ex: /camisetas). Use apenas letras minúsculas, números e hífens.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria Pai (opcional)
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Nenhuma (categoria raiz)</option>
                  {categories
                    .filter((c) => c.id !== editingCategory?.id && !c.parentId)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Selecione uma categoria pai para criar uma subcategoria
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCategory(null)
                    setFormData({ name: '', slug: '', parentId: '' })
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="Nenhuma categoria encontrada"
      />
    </div>
  )
}

