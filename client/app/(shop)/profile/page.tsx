'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { User, Mail, Calendar, Shield, LogOut, Edit2, Save, X } from 'lucide-react'
import api from '@/lib/api'

export default function ProfilePage() {
  const router = useRouter()
  const { user, checkAuth, isAuthenticated, logout, loading } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      })
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
    setError('')
    setSuccess('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      })
    }
    setError('')
    setSuccess('')
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setUpdating(true)

    try {
      const response = await api.put('/auth/profile', {
        name: formData.name,
        email: formData.email,
      })

      if (response.data?.user) {
        setSuccess('Perfil atualizado com sucesso!')
        setIsEditing(false)
        // Atualizar o store
        checkAuth()
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar perfil')
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!user || !isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600 mt-1">Gerencie suas informações pessoais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal - Informações do perfil */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="text-primary-600" size={20} />
                Informações Pessoais
              </CardTitle>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Editar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <Input
                      label="Nome Completo"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      isLoading={updating}
                      disabled={updating}
                      className="flex items-center gap-2"
                    >
                      <Save size={16} />
                      Salvar Alterações
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updating}
                      className="flex items-center gap-2"
                    >
                      <X size={16} />
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <User className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Nome</p>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Membro desde</p>
                      <p className="font-semibold text-gray-900">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {user.role && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Shield className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Tipo de Conta</p>
                        <p className="font-semibold text-gray-900">
                          {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="text-primary-600" size={20} />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Para alterar sua senha, entre em contato com o suporte.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/profile/change-password')}
                >
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Ações rápidas */}
        <div className="space-y-6">
          {/* Card de Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/orders')}
              >
                Meus Pedidos
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/favorites')}
              >
                Meus Favoritos
              </Button>
              {user.role === 'ADMIN' && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/admin/dashboard')}
                >
                  Painel Admin
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Logout */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                onClick={handleLogout}
              >
                <LogOut size={18} className="mr-2" />
                Sair da Conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

