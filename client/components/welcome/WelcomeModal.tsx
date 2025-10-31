'use client'

import React, { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'

interface WelcomeModalProps {
  userName: string
  onClose: () => void
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ userName, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Conteúdo */}
        <div className="text-center">
          {/* Ícone de boas-vindas */}
          <div className="mx-auto w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>

          {/* Título */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Que bom ter você aqui, {userName}!
          </h2>

          {/* Subtítulo */}
          <p className="text-gray-600 mb-8 text-lg">
            Bem-vindo à Manauara Design! Estamos felizes em tê-lo conosco.
          </p>

          {/* Informações adicionais */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Dicas para começar:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Explore nossa coleção de produtos personalizados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Adicione seus produtos favoritos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Acompanhe seus pedidos em tempo real</span>
              </li>
            </ul>
          </div>

          {/* Botão */}
          <Button
            onClick={onClose}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 text-lg"
          >
            Começar a Comprar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

