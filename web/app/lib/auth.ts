/**
 * NextAuth Configuration
 * Temporary: uses credentials provider with mock auth (for dev)
 * In production, integrate with your backend /api/auth/login and /api/auth/signup
 */

import type { NextAuthOptions, Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      role?: string
      merchantId?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    merchantId?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // TODO: Replace with actual backend /api/auth/login call
        // This is a mock implementation for development

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        // Mock validation - in production, call your backend API
        if (credentials.email === 'demo@fluxpay.com' && credentials.password === 'demo123') {
          return {
            id: '1',
            email: credentials.email,
            name: 'Demo User',
            image: null,
            role: 'merchant',
            merchantId: 'merchant_123',
          }
        }

        throw new Error('Invalid email or password')
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = (user as any).role
        token.merchantId = (user as any).merchantId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        ;(session.user as any).merchantId = token.merchantId as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 1 day
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key',
}
