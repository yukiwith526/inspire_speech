import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Skip auth check for auth-related and public routes
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isAuthCallbackPage = req.nextUrl.pathname.startsWith('/auth/callback');
    const isPublicRoute = req.nextUrl.pathname === '/';
    
    if (isAuthCallbackPage) {
      return res;
    }

    // Refresh session if expired - エラーハンドリング追加
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth session error in middleware:', error);
      
      // セッションエラーの場合はパブリックルートとして扱う
      if (!isAuthPage && !isPublicRoute) {
        const redirectUrl = new URL('/auth', req.url);
        return NextResponse.redirect(redirectUrl);
      }
      return res;
    }
    
    if (!session && !isAuthPage && !isPublicRoute) {
      const redirectUrl = new URL('/auth', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If already logged in and trying to access auth page, redirect to home
    if (session && isAuthPage && !isAuthCallbackPage) {
      const redirectUrl = new URL('/', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // エラーが発生しても安全にフォールバック
    return res;
  }
}

// Add routes that should be protected
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|auth/callback).*)'],
}; 