'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Star } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store/authStore'

interface ReviewFormProps {
  productId: string
  onReviewAdded: () => void
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewAdded }) => {
  const { isAuthenticated } = useAuthStore()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600 text-center">
            Faça login para adicionar uma avaliação
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Por favor, selecione uma avaliação')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post(`/reviews/product/${productId}`, {
        rating,
        comment: comment || undefined,
      })
      setRating(0)
      setComment('')
      onReviewAdded()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao adicionar avaliação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Adicionar Avaliação</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avaliação
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Comentário (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Deixe seu comentário sobre o produto..."
            multiline
            rows={4}
          />

          <Button type="submit" isLoading={loading} disabled={rating === 0}>
            Enviar Avaliação
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

