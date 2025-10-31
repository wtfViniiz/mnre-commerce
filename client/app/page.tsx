'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useProductsStore } from '@/lib/store/productsStore'
import { ProductList } from '@/components/product/ProductList'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Shirt, Star, Truck, Shield } from 'lucide-react'
import { BannerCarousel } from '@/components/banner/BannerCarousel'
import { banners } from '@/data/banners'

export default function Home() {
  const { products, fetchProducts, loading } = useProductsStore()

  useEffect(() => {
    fetchProducts({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' })
  }, [])

  return (
    <div className="min-h-screen">
      {/* Banner Carousel */}
      <BannerCarousel banners={banners} autoPlayInterval={5000} />

      {/* Features */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shirt className="text-primary-600" size={28} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Qualidade Premium</h3>
              <p className="text-sm text-gray-600">Camisas de alta qualidade</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="text-primary-600" size={28} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Personalização</h3>
              <p className="text-sm text-gray-600">Crie seu design único</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck className="text-primary-600" size={28} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Frete Grátis</h3>
              <p className="text-sm text-gray-600">Acima de R$ 200</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="text-primary-600" size={28} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Garantia</h3>
              <p className="text-sm text-gray-600">Satisfação garantida</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Produtos em Destaque
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Confira nossas camisas mais populares e novidades exclusivas
          </p>
        </div>
        
        <ProductList products={products} loading={loading} />
        
        <div className="text-center mt-12">
          <Link href="/products">
            <Button size="lg" variant="outline">
              Ver Todos os Produtos
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para criar sua camisa única?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Personalize sua camisa agora e torne-se único no campo!
          </p>
          <Link href="/products">
            <Button size="lg" variant="secondary">
              Começar Agora
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

