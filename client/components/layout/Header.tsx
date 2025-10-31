'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User, Heart, Menu, X, Search, MapPin } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { useAuthStore } from '@/lib/store/authStore'

export const Header: React.FC = () => {
  const { fetchCart, getItemCount } = useCartStore()
  const { checkAuth, isAuthenticated, user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated])

  const itemCount = getItemCount()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <>
      <header className="bg-primary-500 text-black shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Logo e Barra de Busca */}
          <div className="flex items-center justify-between py-4 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Image
                src="/logo/logo.svg"
                alt="Manauara Design"
                width={50}
                height={50}
                className="h-12 w-auto filter"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-black">MANAUARA DESIGN</h1>
                <p className="text-xs text-black">Camisas Personalizadas</p>
              </div>
            </Link>

            {/* Busca Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="o que você procura?"
                  className="w-full px-4 py-2 pr-10 border-0.1 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>

            {/* Ícones Direita */}
            <div className="flex items-center gap-4">
              {/* CEP e Localização */}
              <div className="hidden lg:flex items-center gap-1 px-3 py-2 hover:bg-primary-600 rounded transition-colors cursor-pointer">
                <MapPin size={20} />
                <div className="text-xs">
                  <div>Informe seu CEP</div>
                </div>
              </div>

              {/* Usuário */}
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-primary-600 rounded transition-colors"
                >
                  <User size={20} />
                  <div className="text-xs text-left">
                    <div>{user?.name || 'Olá'}</div>
                    <div className="text-primary-200 text-black">Meus pedidos</div>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-primary-600 rounded transition-colors"
                >
                  <User size={20} />
                  <div className="text-xs text-left">
                    <div>Entre ou cadastre-se</div>
                    <div className="text-primary-200">Meus pedidos</div>
                  </div>
                </Link>
              )}

              {/* Favoritos */}
              {isAuthenticated && (
                <Link
                  href="/favorites"
                  className="hidden md:flex items-center p-2 hover:bg-primary-600 rounded transition-colors relative"
                >
                  <Heart size={24} />
                </Link>
              )}

              {/* Carrinho */}
              <Link
                href="/cart"
                className="relative p-2 hover:bg-primary-600 rounded transition-colors"
              >
                <ShoppingCart size={24} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-primary-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Menu Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-primary-600 rounded transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Menu Mobile Expandido */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 animate-slide-up">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar produtos..."
                    className="w-full px-4 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </form>
              
              <nav className="flex flex-col gap-2 bg-black">
                <Link
                  href="/products"
                  className="px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Todos os Produtos
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      href="/favorites"
                      className="px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Favoritos
                    </Link>
                    <Link
                      href="/orders"
                      className="px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Meus Pedidos
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="px-4 py-2 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    >
                      Sair
                    </button>
                  </>
                )}
                {!isAuthenticated && (
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Entrar / Cadastrar
                  </Link>
                )}
              </nav>
            </div>
          )}

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-6 py-3 border-t border-primary-600">
            <Link
              href="/products"
              className="text-black hover:text-primary-100 font-medium transition-colors"
            >
              Camisetas
            </Link>
            <Link
              href="/products?categoryId=1"
              className="text-black hover:text-primary-100 font-medium transition-colors"
            >
              Times de Futebol
            </Link>
            <Link
              href="/products?categoryId=2"
              className="text-black hover:text-primary-100 font-medium transition-colors"
            >
              Personalizadas
            </Link>
            <Link
              href="/products?categoryId=3"
              className="text-black hover:text-primary-100 font-medium transition-colors"
            >
              Novidades
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/orders"
                  className="text-black hover:text-primary-100 font-medium transition-colors"
                >
                  Meus Pedidos
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  )
}

