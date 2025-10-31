'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store/authStore'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react'
import { signIn } from 'next-auth/react'

export default function AuthPage() {
  const router = useRouter()
  const { login, register } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  
  // Verificar se há parâmetro de tab na URL
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  
  useEffect(() => {
    setMounted(true)
    // Verificar parâmetro da URL apenas no cliente
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'register') {
      setActiveTab('register')
      // Limpar parâmetro da URL
      window.history.replaceState({}, '', '/login')
    }
  }, [])
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  
  // Register state
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      await login(loginEmail, loginPassword)
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao fazer login')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError('')

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('As senhas não coincidem')
      return
    }

    if (registerPassword.length < 6) {
      setRegisterError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setRegisterLoading(true)

    try {
      await register(registerEmail, registerName, registerPassword)
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setRegisterError(err.message || 'Erro ao criar conta')
    } finally {
      setRegisterLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      await signIn(provider, { callbackUrl: '/' })
    } catch (error) {
      console.error(`Erro ao fazer login com ${provider}:`, error)
    }
  }

  // Prevenir hidratação error - garantir que o conteúdo seja consistente
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4 relative overflow-hidden">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Manauara Design</h1>
            <p className="text-gray-600">Bem-vindo!</p>
          </div>
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />
            <CardHeader className="pb-6">
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <div className="flex-1 py-3 px-4 rounded-md font-semibold text-sm bg-primary-600 text-white">
                  <div className="flex items-center justify-center gap-2">
                    <LogIn size={18} />
                    Entrar
                  </div>
                </div>
                <div className="flex-1 py-3 px-4 rounded-md font-semibold text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <UserPlus size={18} />
                    Criar Conta
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-hidden" style={{ minHeight: '400px' }} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Título */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
              Manauara Design
            </h1>
          </Link>
          <p className="text-gray-600">Bem-vindo!</p>
        </div>

        {/* Card único com slide */}
        <Card className="relative overflow-hidden">
          {/* Barra superior colorida */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />
          
          <CardHeader className="pb-6">
            {/* Botões de alternância */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3 px-4 rounded-md font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'login'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <LogIn size={18} />
                  Entrar
                </div>
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-3 px-4 rounded-md font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'register'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <UserPlus size={18} />
                  Criar Conta
                </div>
              </button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Container com slide */}
            <div className="relative overflow-hidden" style={{ minHeight: mounted ? 'auto' : '400px' }}>
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeTab === 'register' ? '50%' : '0%'})` }}
              >
                {/* Formulário de Login - 50% */}
                <div className="w-full flex-shrink-0 px-1">
                  <form onSubmit={handleLogin} className="space-y-5">
                    {loginError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                        <span className="text-red-500">⚠</span>
                        {loginError}
                      </div>
                    )}

                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Mail className="text-gray-400" size={18} />
                      </div>
                      <Input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        placeholder="seu@email.com"
                        className="pl-10 h-12"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Lock className="text-gray-400" size={18} />
                      </div>
                      <Input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        placeholder="Sua senha"
                        className="pl-10 h-12"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 h-12 text-base"
                      isLoading={loginLoading}
                      disabled={loginLoading}
                    >
                      Entrar
                    </Button>
                  </form>
                </div>

                {/* Formulário de Registro - 50% */}
                <div className="w-full flex-shrink-0 px-1">
                  <form onSubmit={handleRegister} className="space-y-5">
                    {registerError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                        <span className="text-red-500">⚠</span>
                        {registerError}
                      </div>
                    )}

                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <User className="text-gray-400" size={18} />
                      </div>
                      <Input
                        type="text"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                        placeholder="Seu nome completo"
                        className="pl-10 h-12"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Mail className="text-gray-400" size={18} />
                      </div>
                      <Input
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        placeholder="seu@email.com"
                        className="pl-10 h-12"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Lock className="text-gray-400" size={18} />
                      </div>
                      <Input
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        placeholder="Mínimo 6 caracteres"
                        className="pl-10 h-12"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Lock className="text-gray-400" size={18} />
                      </div>
                      <Input
                        type="password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirme sua senha"
                        className="pl-10 h-12"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 h-12 text-base"
                      isLoading={registerLoading}
                      disabled={registerLoading}
                    >
                      Criar Conta
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Divisor */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou</span>
              </div>
            </div>

            {/* Botões de login social */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-3 border-2 hover:bg-gray-50"
                onClick={() => handleSocialLogin('google')}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium">Continuar com Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-3 border-2 hover:bg-gray-50"
                onClick={() => handleSocialLogin('apple')}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.38-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span className="font-medium">Continuar com Apple</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-primary-600 hover:underline">Termos de Uso</a>
            {' '}e{' '}
            <a href="#" className="text-primary-600 hover:underline">Política de Privacidade</a>
          </p>
        </div>
      </div>
    </div>
  )
}
