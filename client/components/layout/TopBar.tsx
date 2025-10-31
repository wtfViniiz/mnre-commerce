'use client'

import React from 'react'
import { User, BookOpen, RefreshCw, Gift, MessageCircle, Briefcase, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

export const TopBar: React.FC = () => {
  return (
    <div className="bg-primary-700 text-white py-2 text-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
            <Link href="/accessibility" className="flex items-center gap-1 hover:text-primary-500 transition-colors">
              <User size={14} />
              <span>Acessibilidade</span>
            </Link>
            <Link href="/blog" className="flex items-center gap-1 hover:text-primary-500 transition-colors">
              <BookOpen size={14} />
              <span>Blog | Manauara Design</span>
            </Link>
            <Link href="/exchange" className="flex items-center gap-1 hover:text-primary-500 transition-colors">
              <RefreshCw size={14} />
              <span>Troca na loja e no site</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-end">
            <Link href="/gift-card" className="flex items-center gap-1 hover:text-primary-500 transition-colors">
              <Gift size={14} />
              <span>Cartão presente</span>
            </Link>
            <Link href="/support" className="flex items-center gap-1 hover:text-primary-500 transition-colors">
              <MessageCircle size={14} />
              <span>Atendimento</span>
            </Link>
            <Link href="/business" className="flex items-center gap-1 hover:text-primary-500 transition-colors">
              <Briefcase size={14} />
              <span>Soluções para empresas</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

