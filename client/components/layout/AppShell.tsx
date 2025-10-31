'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { TopBar } from './TopBar'
import { Header } from './Header'
import { Footer } from './Footer'
import { WelcomeHandler } from '@/components/welcome/WelcomeHandler'

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register')
  const isAdminPage = pathname?.startsWith('/admin')

  // Não mostrar header/footer em páginas de autenticação ou admin
  if (isAuthPage || isAdminPage) {
    return (
      <>
        <WelcomeHandler />
        {children}
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <WelcomeHandler />
      <TopBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

