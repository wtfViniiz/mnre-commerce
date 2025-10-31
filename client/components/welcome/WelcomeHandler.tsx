'use client'

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { useSession } from 'next-auth/react'
import { WelcomeModal } from './WelcomeModal'
import { CompleteProfileModal } from '@/components/onboarding/CompleteProfileModal'

export const WelcomeHandler: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { data: session } = useSession()
  const [showWelcome, setShowWelcome] = useState(false)
  const [showCompleteProfile, setShowCompleteProfile] = useState(false)

  useEffect(() => {
    // Verificar se já mostrou o welcome e se precisa completar perfil
    const currentUser = user || (session?.user as any)
    
    if (typeof window !== 'undefined' && currentUser && (isAuthenticated || session)) {
      const userId = currentUser.id || currentUser.email
      const welcomeKey = `welcome_shown_${userId}`
      const profileKey = `profile_completed_${userId}`
      
      const hasShownWelcome = localStorage.getItem(welcomeKey)
      const hasCompletedProfile = localStorage.getItem(profileKey) || (currentUser as any)?.profileCompleted
      
      if (!hasShownWelcome) {
        // Mostrar welcome primeiro
        const timer = setTimeout(() => {
          setShowWelcome(true)
        }, 300)
        return () => clearTimeout(timer)
      } else if (!hasCompletedProfile) {
        // Depois do welcome, verificar se precisa completar perfil
        // Especialmente para logins sociais que podem não ter todas as informações
        const needsProfile = !(currentUser as any)?.cpf || 
                           !(currentUser as any)?.phone ||
                           !(currentUser as any)?.birthDate ||
                           !currentUser.name || 
                           currentUser.name.split(' ').length < 2
        
        if (needsProfile) {
          const timer = setTimeout(() => {
            setShowCompleteProfile(true)
          }, 500)
          return () => clearTimeout(timer)
        }
      }
    }
  }, [user, isAuthenticated, session])

  const handleWelcomeClose = () => {
    setShowWelcome(false)
    // Após fechar o welcome, verificar se precisa completar perfil
    const currentUser = user || (session?.user as any)
    if (currentUser) {
      const userId = currentUser.id || currentUser.email
      const profileKey = `profile_completed_${userId}`
      const hasCompletedProfile = localStorage.getItem(profileKey)
      
      if (!hasCompletedProfile) {
        const needsProfile = !currentUser.name || 
                           currentUser.name.split(' ').length < 2
        if (needsProfile) {
          setTimeout(() => setShowCompleteProfile(true), 300)
        }
      }
    }
    
    // Marcar welcome como mostrado
    if (user || session?.user) {
      const userId = (user?.id || (session?.user as any)?.id || (session?.user as any)?.email)
      localStorage.setItem(`welcome_shown_${userId}`, 'true')
    }
  }

  const handleProfileComplete = () => {
    setShowCompleteProfile(false)
    // Marcar perfil como completo
    const currentUser = user || (session?.user as any)
    if (currentUser) {
      const userId = currentUser.id || currentUser.email
      localStorage.setItem(`profile_completed_${userId}`, 'true')
    }
  }

  const currentUser = user || (session?.user as any)
  
  // Mostrar complete profile primeiro se necessário
  if (showCompleteProfile && currentUser) {
    return (
      <CompleteProfileModal
        userEmail={currentUser.email}
        onComplete={handleProfileComplete}
      />
    )
  }

  // Depois mostrar welcome
  if (showWelcome && currentUser) {
    return (
      <WelcomeModal 
        userName={currentUser.name || 'Usuário'} 
        onClose={handleWelcomeClose} 
      />
    )
  }

  return null
}

