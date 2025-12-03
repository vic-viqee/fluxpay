import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard', '/dashboard/clients', '/dashboard/payments', '/dashboard/settings']
const authRoutes = ['/login', '/signup', '/forgot-password']
const publicRoutes = ['/', '/about', '/features', '/pricing', '/blog', '/faq', '/testimonials', '/help-center', '/contact', '/components-showcase', '/demo']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // If user is authenticated
  if (token) {
    // Redirect away from auth pages to dashboard
    if (authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // If user is not authenticated
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
