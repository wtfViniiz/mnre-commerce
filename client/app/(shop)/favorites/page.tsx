'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { Favorite, Product } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import api from '@/lib/api'
import Link from 'next/link'
import { Heart, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { ProductCard } from '@/components/product/ProductCard'

export default function FavoritesPage() {
  const router = useRouter()
  const { isAuthenticated, checkAuth } = useAuthStore()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchFavorites = async () => {
      try {
        const response = await api.get('/favorites')
        setFavorites(response.data)
      } catch (error) {
        console.error('Erro ao buscar favoritos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [isAuthenticated])

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await api.delete(`/favorites/${productId}`)
      setFavorites(favorites.filter((fav) => fav.productId !== productId))
    } catch (error) {
      console.error('Erro ao remover favorito:', error)
    }
  }

  if (!isAuthenticated) {
    return null
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/products">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft size={16} className="mr-2" />
            Voltar para Produtos
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Meus Favoritos</h1>
        <p className="text-gray-600 mt-2">Produtos que você marcou como favorito</p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhum favorito ainda
            </h2>
            <p className="text-gray-600 mb-6">
              Comece a adicionar produtos aos seus favoritos!
            </p>
            <Link href="/products">
              <Button>Ver Produtos</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((favorite) => {
            if (!favorite.product) return null
            return (
              <ProductCard
                key={favorite.id}
                product={favorite.product}
                isFavorite={true}
                onFavoriteToggle={() => handleRemoveFavorite(favorite.productId)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

