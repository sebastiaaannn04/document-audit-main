import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'

const protectedRoutes = ['/']
const publicRoutes = ['/login', '/register']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // Public assets and API bypass
  if (path.startsWith('/_next') || path.startsWith('/api') || path.startsWith('/uploads')) {
     return NextResponse.next()
  }

  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)

  const session = await verifySession()

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
