import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Proteger rotas admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // A verificação de autenticação será feita no cliente
    // pois precisamos do token JWT
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}

