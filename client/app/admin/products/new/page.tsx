'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import api from '@/lib/api'
import { ArrowLeft, Plus, X, Upload } from 'lucide-react'

interface Category {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [categoryId, setCategoryId] = useState('')
  const [images, setImages] = useState<string[]>([''])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await api.get('/categories')
      // A API pode retornar { categories: [] } ou [] diretamente
      const cats = response.data.categories || response.data || []
      setCategories(Array.isArray(cats) ? cats : [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleAddImage = () => {
    setImages([...images, ''])
  }

  const handleRemoveImage = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index))
    }
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images]
    newImages[index] = value
    setImages(newImages)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    }

    if (!price || Number(price) <= 0) {
      newErrors.price = 'Preço deve ser maior que zero'
    }

    if (!categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória'
    }

    if (Number(stock) < 0) {
      newErrors.stock = 'Estoque não pode ser negativo'
    }

    const validImages = images.filter(img => img.trim())
    if (validImages.length === 0) {
      newErrors.images = 'Adicione pelo menos uma imagem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const validImages = images.filter(img => img.trim())
      
      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock) || 0,
        categoryId,
        images: validImages,
      }

      await api.post('/products', productData)
      router.push('/admin/products')
    } catch (error: any) {
      console.error('Erro ao criar produto:', error)
      alert(error.response?.data?.error || 'Erro ao criar produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Produto</h1>
          <p className="text-gray-600 mt-1">Adicione um novo produto ao catálogo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Produto *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Camiseta Personalizada..."
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o produto em detalhes..."
                    rows={8}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Imagens */}
            <Card>
              <CardHeader>
                <CardTitle>Imagens do Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="flex-1"
                    />
                    {images.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveImage(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X size={20} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddImage}
                  className="w-full"
                >
                  <Plus size={20} className="mr-2" />
                  Adicionar Imagem
                </Button>
                {errors.images && (
                  <p className="text-red-500 text-sm">{errors.images}</p>
                )}
                <p className="text-xs text-gray-500">
                  Cole as URLs das imagens. Use imagens de alta qualidade.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publicar */}
            <Card>
              <CardHeader>
                <CardTitle>Publicar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={loading}
                  disabled={loading}
                >
                  Criar Produto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
              </CardContent>
            </Card>

            {/* Preço e Estoque */}
            <Card>
              <CardHeader>
                <CardTitle>Preço e Estoque</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estoque *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    className={errors.stock ? 'border-red-500' : ''}
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCategories ? (
                  <Loading />
                ) : (
                  <div>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.categoryId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

