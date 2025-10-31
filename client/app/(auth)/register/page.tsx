'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a página de login unificada
    router.replace('/login?tab=register')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
}
