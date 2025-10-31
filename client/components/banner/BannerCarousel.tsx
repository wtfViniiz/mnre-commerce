'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Banner {
  id: string
  image: string
  title?: string
  description?: string
  link?: string
  alt: string
}

interface BannerCarouselProps {
  banners: Banner[]
  autoPlayInterval?: number
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasMovedRef = useRef(false)

  // Garantir que só renderiza no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-play - só roda após montar no cliente
  useEffect(() => {
    if (!mounted || banners.length <= 1) return

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, autoPlayInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [mounted, banners.length, autoPlayInterval])

  // Pausar auto-play ao interagir
  const pauseAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const resumeAutoPlay = useCallback(() => {
    if (banners.length <= 1) return
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, autoPlayInterval)
  }, [banners.length, autoPlayInterval])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
    pauseAutoPlay()
    setTimeout(() => {
      resumeAutoPlay()
    }, 3000)
  }, [pauseAutoPlay, resumeAutoPlay])

  const goToPrevious = useCallback(() => {
    goToSlide((currentIndex - 1 + banners.length) % banners.length)
  }, [currentIndex, banners.length, goToSlide])

  const goToNext = useCallback(() => {
    goToSlide((currentIndex + 1) % banners.length)
  }, [currentIndex, banners.length, goToSlide])

  // Swipe handlers - navegação por arrasto sem arrastar a imagem
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setHasMoved(false)
    hasMovedRef.current = false
    setStartX(e.pageX)
    pauseAutoPlay()
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      setHasMoved(false)
      hasMovedRef.current = false
      resumeAutoPlay()
    }
  }

  const handleMouseUp = (e?: React.MouseEvent) => {
    if (!isDragging) return
    
    setIsDragging(false)
    // Reset após um pequeno delay para permitir que onClick do link funcione
    setTimeout(() => {
      setHasMoved(false)
      hasMovedRef.current = false
    }, 100)
    resumeAutoPlay()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const currentX = e.pageX
    const diffX = startX - currentX
    const threshold = 30 // Threshold para detectar movimento

    // Se moveu mais que o threshold, foi um arrasto (não clique)
    if (Math.abs(diffX) > threshold) {
      setHasMoved(true)
      hasMovedRef.current = true
      // Prevenir arrasto padrão da imagem
      e.preventDefault()
      e.stopPropagation()
    }

    // Se moveu significativamente, navegar
    if (Math.abs(diffX) > 80) {
      if (diffX > 0 && currentIndex < banners.length - 1) {
        // Arrastou para esquerda - próximo banner
        goToNext()
        setIsDragging(false)
        setHasMoved(false)
        hasMovedRef.current = false
        resumeAutoPlay()
      } else if (diffX < 0 && currentIndex > 0) {
        // Arrastou para direita - banner anterior
        goToPrevious()
        setIsDragging(false)
        setHasMoved(false)
        hasMovedRef.current = false
        resumeAutoPlay()
      }
    }
  }

  // Touch handlers para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setHasMoved(false)
    setStartX(e.touches[0].pageX)
    pauseAutoPlay()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    e.preventDefault()
    const currentX = e.touches[0].pageX
    const diffX = startX - currentX
    const threshold = 30

    if (Math.abs(diffX) > threshold) {
      setHasMoved(true)
    }

    if (Math.abs(diffX) > 80) {
      if (diffX > 0 && currentIndex < banners.length - 1) {
        goToNext()
        setIsDragging(false)
        setHasMoved(false)
        resumeAutoPlay()
      } else if (diffX < 0 && currentIndex > 0) {
        goToPrevious()
        setIsDragging(false)
        setHasMoved(false)
        resumeAutoPlay()
      }
    }
  }

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false)
      setHasMoved(false)
      resumeAutoPlay()
    }
  }

  if (banners.length === 0) return null

  return (
    <div className="relative w-full bg-gray-100 overflow-hidden group">
      <div
        ref={carouselRef}
        className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] select-none"
        onMouseDown={mounted ? handleMouseDown : undefined}
        onMouseLeave={mounted ? handleMouseLeave : undefined}
        onMouseUp={mounted ? (e) => handleMouseUp(e) : undefined}
        onMouseMove={mounted ? handleMouseMove : undefined}
        onTouchStart={mounted ? handleTouchStart : undefined}
        onTouchMove={mounted ? handleTouchMove : undefined}
        onTouchEnd={mounted ? handleTouchEnd : undefined}
      >
        {/* Banners */}
        <div className="relative w-full h-full">
          {banners.map((banner, index) => {
            // Durante SSR, mostrar apenas o primeiro banner
            const isActive = mounted ? index === currentIndex : index === 0
            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {banner.link ? (
                  <Link 
                    href={banner.link} 
                    className="block relative w-full h-full"
                    onClick={(e) => {
                      // Se moveu durante o arrasto, prevenir clique no link
                      if (hasMovedRef.current) {
                        e.preventDefault()
                        e.stopPropagation()
                      }
                    }}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={banner.image}
                        alt={banner.alt}
                        fill
                        className="object-cover select-none"
                        priority={mounted ? index === currentIndex : index === 0}
                        sizes="100vw"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                      {(banner.title || banner.description) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <div className="text-center text-white px-4">
                            {banner.title && (
                              <h2 className="text-3xl md:text-5xl font-bold mb-2">
                                {banner.title}
                              </h2>
                            )}
                            {banner.description && (
                              <p className="text-lg md:text-xl">{banner.description}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={banner.image}
                      alt={banner.alt}
                      fill
                      className="object-cover select-none"
                      priority={mounted ? index === currentIndex : index === 0}
                      sizes="100vw"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                    {(banner.title || banner.description) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                        <div className="text-center text-white px-4">
                          {banner.title && (
                            <h2 className="text-3xl md:text-5xl font-bold mb-2">
                              {banner.title}
                            </h2>
                          )}
                          {banner.description && (
                            <p className="text-lg md:text-xl">{banner.description}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Setas de navegação */}
        {mounted && banners.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              onMouseEnter={pauseAutoPlay}
              onMouseLeave={resumeAutoPlay}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
              aria-label="Banner anterior"
            >
              <ChevronLeft size={32} className="text-gray-800" />
            </button>
            <button
              onClick={goToNext}
              onMouseEnter={pauseAutoPlay}
              onMouseLeave={resumeAutoPlay}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
              aria-label="Próximo banner"
            >
              <ChevronRight size={32} className="text-gray-800" />
            </button>
          </>
        )}

        {/* Indicadores */}
        {mounted && banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                onMouseEnter={pauseAutoPlay}
                onMouseLeave={resumeAutoPlay}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`Ir para banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

