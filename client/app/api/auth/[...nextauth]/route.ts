import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import api from '@/lib/api'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await api.post('/auth/login', {
            email: credentials.email,
            password: credentials.password,
          })

          if (response.data && response.data.user) {
            // Salvar token no localStorage (será gerenciado pelo client)
            if (typeof window !== 'undefined' && response.data.token) {
              localStorage.setItem('token', response.data.token)
            }

            return {
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.name,
              token: response.data.token,
            }
          }

          return null
        } catch (error: any) {
          console.error('Erro no login:', error)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // Apple provider precisa de configuração adicional
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.token = (user as any).token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session as any).token = token.token
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

