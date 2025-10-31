'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react'
import { HelpCard } from '@/components/help/HelpCard'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo/logo.svg"
                alt="Manauara Design"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <div>
                <h3 className="text-lg font-bold">Manauara Design</h3>
                <p className="text-sm text-gray-400">Camisas Personalizadas</p>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Especialistas em camisas personalizadas de futebol e produtos esportivos. 
              Qualidade, criatividade e paixão em cada peça!
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/manauaradesign"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-primary-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com/manauaradesign"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-primary-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-primary-500 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/products" className="hover:text-primary-500 transition-colors">
                  Todos os Produtos
                </Link>
              </li>
              <li>
                <Link href="/products?categoryId=1" className="hover:text-primary-500 transition-colors">
                  Times de Futebol
                </Link>
              </li>
              <li>
                <Link href="/products?categoryId=2" className="hover:text-primary-500 transition-colors">
                  Camisas Personalizadas
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-primary-500 transition-colors">
                  Meu Carrinho
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/orders" className="hover:text-primary-500 transition-colors">
                  Meus Pedidos
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-500 transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-500 transition-colors">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-500 transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Entre em Contato</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2">
                <Phone size={18} className="mt-1 flex-shrink-0" />
                <a href="tel:+5511999999999" className="hover:text-primary-500 transition-colors">
                  (11) 99999-9999
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={18} className="mt-1 flex-shrink-0" />
                <a href="mailto:contato@manauaradesign.com.br" className="hover:text-primary-500 transition-colors">
                  contato@manauaradesign.com.br
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span>São Paulo - SP, Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
              <p className="text-gray-400 text-sm text-center md:text-left">
                &copy; {new Date().getFullYear()} Manauara Design. Todos os direitos reservados.
              </p>
              <div className="flex gap-6 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-primary-500 transition-colors">
                  Política de Privacidade
                </Link>
                <Link href="/terms" className="hover:text-primary-500 transition-colors">
                  Termos de Uso
                </Link>
              </div>
            </div>
            {/* Botão de Ajuda */}
            <div className="mt-4">
              <HelpCard />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

