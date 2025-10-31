'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store/authStore'
import { useRouter } from 'next/navigation'

interface CompleteProfileModalProps {
  userEmail?: string
  onComplete: () => void
}

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
  userEmail = '',
  onComplete,
}) => {
  const { user, checkAuth } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fechar quando sair da página ou navegar
  useEffect(() => {
    const handleRouteChange = () => {
      onComplete()
    }

    // Detectar navegação
    window.addEventListener('beforeunload', handleRouteChange)
    
    // Também fechar se a rota mudar (Next.js router)
    const handlePopState = () => {
      onComplete()
    }
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleRouteChange)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [onComplete])
  
  const [formData, setFormData] = useState({
    cpf: '',
    email: userEmail || user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    birthDate: '',
    phone: '',
    acceptTerms: false,
  })

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return value
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{4})$/, '$1-$2')
    }
    return value
  }

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 8) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')
    }
    return value
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar CPF
    const cpfNumbers = formData.cpf.replace(/\D/g, '')
    if (!cpfNumbers || cpfNumbers.length !== 11) {
      newErrors.cpf = 'CPF inválido'
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    // Validar nome
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Primeiro nome é obrigatório'
    }

    // Validar sobrenome
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório'
    }

    // Validar data de nascimento
    const dateNumbers = formData.birthDate.replace(/\D/g, '')
    if (!dateNumbers || dateNumbers.length !== 8) {
      newErrors.birthDate = 'Data de nascimento inválida'
    }

    // Validar telefone
    const phoneNumbers = formData.phone.replace(/\D/g, '')
    if (!phoneNumbers || phoneNumbers.length < 10) {
      newErrors.phone = 'Telefone inválido'
    }

    // Validar termos
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Você deve aceitar os termos de uso'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Atualizar perfil com as informações adicionais
      await api.put('/auth/profile', {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        cpf: formData.cpf,
        phone: formData.phone,
        birthDate: formData.birthDate,
      })

      // Recarregar dados do usuário
      await checkAuth()

      // Marcar como completo
      if (user) {
        const userId = user.id || user.email
        localStorage.setItem(`profile_completed_${userId}`, 'true')
      }

      onComplete()
    } catch (error: any) {
      console.error('Erro ao completar perfil:', error)
      alert(error.response?.data?.error || 'Erro ao salvar informações. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(e)
  }

  const handleBack = () => {
    // Se o usuário não completou, pode voltar ao login/cadastro
    onComplete()
  }

  return (
    <Modal isOpen={true} onClose={handleBack} size="lg">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col">
        {/* Título fixo no topo */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Que bom ter você aqui!
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              Informe os dados abaixo para continuar com o acesso
            </p>
          </div>
        </div>

        {/* Conteúdo com scroll */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <form onSubmit={handleFormSubmit} id="completeProfileForm" className="space-y-4 md:space-y-5">
          {/* CPF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              CPF
            </label>
            <Input
              value={formData.cpf}
              onChange={(e) =>
                setFormData({ ...formData, cpf: formatCPF(e.target.value) })
              }
              placeholder="000.000.000-00"
              maxLength={14}
              className={`w-full ${errors.cpf ? 'border-red-500' : ''}`}
            />
            {errors.cpf && (
              <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Endereço de email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="seu@email.com"
              className={`w-full ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Nome e Sobrenome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Primeiro nome
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="João"
                className={`w-full ${errors.firstName ? 'border-red-500' : ''}`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sobrenome
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Silva"
                className={`w-full ${errors.lastName ? 'border-red-500' : ''}`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Data de nascimento
            </label>
            <Input
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: formatDate(e.target.value) })
              }
              placeholder="dd/mm/aaaa"
              maxLength={10}
              className={`w-full ${errors.birthDate ? 'border-red-500' : ''}`}
            />
            {errors.birthDate && (
              <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Número de telefone
            </label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: formatPhone(e.target.value) })
              }
              placeholder="(00) 000000000"
              maxLength={15}
              className={`w-full ${errors.phone ? 'border-red-500' : ''}`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Termos */}
          <div className="flex items-start gap-2 md:gap-3 pt-1">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={formData.acceptTerms}
              onChange={(e) =>
                setFormData({ ...formData, acceptTerms: e.target.checked })
              }
              className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer flex-shrink-0"
            />
            <label
              htmlFor="acceptTerms"
              className="text-xs md:text-sm text-gray-700 cursor-pointer flex-1 leading-relaxed"
            >
              Li e concordo com os{' '}
              <a
                href="/terms"
                target="_blank"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Termos de uso
              </a>
              {' '}e{' '}
              <a
                href="/privacy"
                target="_blank"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Política de Privacidade
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-red-500 text-xs -mt-2">{errors.acceptTerms}</p>
          )}
          </form>
        </div>

        {/* Rodapé fixo */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 border-t border-gray-200 flex-shrink-0 space-y-3 bg-white">
          {/* Botões */}
          <Button
            type="submit"
            form="completeProfileForm"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 md:py-3 text-base md:text-lg"
            isLoading={loading}
            disabled={loading}
          >
            Continuar
          </Button>
          <button
            type="button"
            onClick={handleBack}
            className="w-full text-primary-600 hover:text-primary-700 font-medium py-2 text-sm md:text-base"
          >
            Voltar
          </button>

          {/* Informações adicionais */}
          <div className="pt-2 space-y-1.5">
            <p className="text-xs text-gray-600 text-center">
              O acesso só é permitido com CPF.
            </p>
            <p className="text-xs text-gray-600 text-center">
              Quer entrar com seu CNPJ?{' '}
              <a
                href="/login"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Criar conta
              </a>
            </p>
            <div className="flex justify-center pt-1">
              <a
                href="#"
                className="text-primary-600 hover:text-primary-700 text-xs underline flex items-center gap-1.5"
              >
                Preciso de ajuda
                <div className="w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">?</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

