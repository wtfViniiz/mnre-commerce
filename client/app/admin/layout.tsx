'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { Sidebar } from '@/components/admin/Sidebar'
import { Loading } from '@/components/ui/Loading'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { checkAuth, isAuthenticated, user, loading } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      setChecking(true)
      try {
        await checkAuth()
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
      } finally {
        setChecking(false)
      }
    }
    verifyAuth()
  }, [checkAuth])

  useEffect(() => {
    // Só redirecionar se já terminou de verificar e não está autenticado ou não é admin
    if (!checking && !loading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/login')
    }
  }, [checking, isAuthenticated, user, loading, router])

  // Mostrar loading enquanto está verificando
  if (checking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  // Se não está autenticado ou não é admin, não renderizar nada (será redirecionado)
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

