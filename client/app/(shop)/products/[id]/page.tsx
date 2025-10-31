'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useProductsStore } from '@/lib/store/productsStore'
import { useCartStore } from '@/lib/store/cartStore'
import { useAuthStore } from '@/lib/store/authStore'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { ReviewForm } from '@/components/product/ReviewForm'
import api from '@/lib/api'

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const { fetchProductById } = useProductsStore()
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)
      const data = await fetchProductById(productId)
      setProduct(data)
      setLoading(false)

      // Verificar se é favorito
      if (isAuthenticated && productId) {
        try {
          const response = await api.get(`/favorites/check/${productId}`)
          setIsFavorite(response.data.isFavorite)
        } catch (error) {
          // Ignorar erro
        }
      }
    }

    if (productId) {
      loadProduct()
    }
  }, [productId, isAuthenticated])

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Faça login para adicionar aos favoritos')
      return
    }

    setLoadingFavorite(true)
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${productId}`)
        setIsFavorite(false)
      } else {
        await api.post('/favorites', { productId })
        setIsFavorite(true)
      }
    } catch (error: any) {
      console.error('Erro ao atualizar favorito:', error)
      alert(error.response?.data?.error || 'Erro ao atualizar favorito')
    } finally {
      setLoadingFavorite(false)
    }
  }

  const handleReviewAdded = async () => {
    // Recarregar produto para atualizar reviews
    const data = await fetchProductById(productId)
    setProduct(data)
  }

  const handleAddToCart = async () => {
    if (!product) return

    setIsAddingToCart(true)
    try {
      await addItem(product, quantity)
      alert('Produto adicionado ao carrinho!')
    } catch (error) {
      alert('Erro ao adicionar ao carrinho. Tente novamente.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loading size="lg" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Produto não encontrado
          </h2>
          <p className="text-gray-600">O produto que você procura não existe.</p>
        </div>
      </div>
    )
  }

  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images || '[]')
    : []

  const currentImage = images[selectedImageIndex] || images[0] || '/placeholder-image.jpg'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galeria de Imagens */}
        <div>
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index
                      ? 'border-primary-600'
                      : 'border-gray-200'
                  }`}
                >
                  <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações do Produto */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            {isAuthenticated && (
              <button
                onClick={handleToggleFavorite}
                disabled={loadingFavorite}
                className={`ml-4 p-2 transition-colors ${
                  isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart size={28} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {product.category && (
            <p className="text-gray-500 mb-4">{product.category.name}</p>
          )}

          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-bold text-gray-900">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center text-yellow-500">
                  <Star size={24} fill="currentColor" />
                  <span className="ml-1 text-lg font-medium">{product.rating.toFixed(1)}</span>
                </div>
                {product.reviews && (
                  <span className="text-gray-500">
                    ({product.reviews.length} avaliações)
                  </span>
                )}
              </div>
            )}
          </div>

          {product.stock > 0 ? (
            <p className="text-green-600 font-medium mb-4">
              Em estoque ({product.stock} disponíveis)
            </p>
          ) : (
            <p className="text-red-600 font-medium mb-4">Esgotado</p>
          )}

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Quantidade</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-20 text-center"
                  min={1}
                  max={product.stock}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart}
            isLoading={isAddingToCart}
            className="w-full mb-4"
            size="lg"
          >
            <ShoppingCart size={20} className="mr-2" />
            Adicionar ao Carrinho
          </Button>

          {/* Descrição Detalhada */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Descrição do Produto</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Informações do Produto</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Categoria</p>
                  <p className="font-medium text-gray-900">{product.category?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Código do Produto</p>
                  <p className="font-medium text-gray-900 font-mono text-sm">{product.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estoque Disponível</p>
                  <p className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} unidades` : 'Esgotado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avaliação</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          className={
                            star <= Math.round(product.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating > 0 ? product.rating.toFixed(1) : 'Sem avaliações'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Avaliações</h2>
        
        {isAuthenticated && (
          <div className="mb-6">
            <ReviewForm productId={product.id} onReviewAdded={handleReviewAdded} />
          </div>
        )}

        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review: any) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.user?.name || 'Usuário'}
                      </p>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < review.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Nenhuma avaliação ainda. Seja o primeiro a avaliar!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

