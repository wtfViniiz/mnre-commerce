'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cartStore'
import { useAuthStore } from '@/lib/store/authStore'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { Address } from '@/types'
import api from '@/lib/api'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, fetchCart } = useCartStore()
  const { isAuthenticated, checkAuth } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState<Address>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({})

  useEffect(() => {
    checkAuth()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchCart()
  }, [isAuthenticated])

  const validateAddress = (): boolean => {
    const newErrors: Partial<Record<keyof Address, string>> = {}

    if (!address.street) newErrors.street = 'Rua é obrigatória'
    if (!address.number) newErrors.number = 'Número é obrigatório'
    if (!address.neighborhood) newErrors.neighborhood = 'Bairro é obrigatório'
    if (!address.city) newErrors.city = 'Cidade é obrigatória'
    if (!address.state) newErrors.state = 'Estado é obrigatório'
    if (!address.zipCode) {
      newErrors.zipCode = 'CEP é obrigatório'
    } else if (!/^\d{5}-?\d{3}$/.test(address.zipCode)) {
      newErrors.zipCode = 'CEP inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateAddress()) {
      return
    }

    if (items.length === 0) {
      alert('Seu carrinho está vazio')
      return
    }

    setLoading(true)

    try {
      // Criar pedido
      const orderResponse = await api.post('/orders', {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        address,
      })

      const orderId = orderResponse.data.id

      // Criar preferência de pagamento
      const paymentResponse = await api.post('/payment/preference', {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        orderId,
        address,
      })

      // Redirecionar para Mercado Pago
      if (paymentResponse.data.initPoint) {
        window.location.href = paymentResponse.data.initPoint
      } else if (paymentResponse.data.sandboxInitPoint) {
        window.location.href = paymentResponse.data.sandboxInitPoint
      } else {
        throw new Error('Erro ao gerar link de pagamento')
      }
    } catch (error: any) {
      console.error('Erro no checkout:', error)
      alert(error.response?.data?.error || 'Erro ao processar pedido. Tente novamente.')
      setLoading(false)
    }
  }

  const subtotal = getTotal()
  const shipping = subtotal > 200 ? 0 : 15
  const total = subtotal + shipping

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Endereço de Entrega */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Endereço de Entrega</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="CEP"
                      value={address.zipCode}
                      onChange={(e) =>
                        setAddress({ ...address, zipCode: e.target.value })
                      }
                      error={errors.zipCode}
                      placeholder="00000-000"
                    />
                    <Input
                      label="Estado"
                      value={address.state}
                      onChange={(e) =>
                        setAddress({ ...address, state: e.target.value })
                      }
                      error={errors.state}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                  <Input
                    label="Cidade"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    error={errors.city}
                  />
                  <Input
                    label="Bairro"
                    value={address.neighborhood}
                    onChange={(e) =>
                      setAddress({ ...address, neighborhood: e.target.value })
                    }
                    error={errors.neighborhood}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Input
                        label="Rua"
                        value={address.street}
                        onChange={(e) =>
                          setAddress({ ...address, street: e.target.value })
                        }
                        error={errors.street}
                      />
                    </div>
                    <Input
                      label="Número"
                      value={address.number}
                      onChange={(e) =>
                        setAddress({ ...address, number: e.target.value })
                      }
                      error={errors.number}
                    />
                  </div>
                  <Input
                    label="Complemento (opcional)"
                    value={address.complement}
                    onChange={(e) =>
                      setAddress({ ...address, complement: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resumo do Pedido */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Itens do Pedido</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <span className="text-gray-600">
                        {item.product?.name} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        R$ {((item.product?.price || 0) * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Final */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Resumo</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Frete</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-semibold">Grátis</span>
                      ) : (
                        `R$ ${shipping.toFixed(2).replace('.', ',')}`
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={loading}
                  disabled={items.length === 0}
                >
                  Finalizar Pedido
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

