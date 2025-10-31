'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { X, Phone } from 'lucide-react'

interface HelpCardProps {
  className?: string
}

export const HelpCard: React.FC<HelpCardProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botão de Ajuda */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors ${className}`}
      >
        <span className="underline">Preciso de ajuda</span>
        <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">?</span>
        </div>
      </button>

      {/* Modal de Ajuda */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Precisa de Ajuda?</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary-600 hover:text-primary-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Subtítulo */}
            <h3 className="font-semibold text-gray-900 mb-4">
              Fale com nossos atletas
            </h3>

            {/* Contato SAC */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-primary-600 font-semibold">SAC:</span>
              <a
                href="tel:+551132303705"
                className="text-primary-600 font-semibold text-lg hover:text-primary-700 transition-colors flex items-center gap-2"
              >
                (11) 3230-3705
                <Phone size={18} className="text-primary-600" />
              </a>
            </div>

            {/* Horários */}
            <p className="text-sm text-gray-600 leading-relaxed">
              Nosso atendimento é de segunda a sábado das 08h às 20h, exceto feriados.
            </p>

            {/* Informação adicional */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Você também pode nos encontrar através do email de suporte ou chat online.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

