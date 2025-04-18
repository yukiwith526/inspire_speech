import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // コードをセッションに交換
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    // エラー確認
    if (error) {
      console.error('Auth callback error:', error);
      // エラーページかログインページにリダイレクト
      return NextResponse.redirect(new URL('/auth?error=session_error', origin));
    }
    
    // ユーザーがログインしているか確認
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // ログイン済みならホームページへリダイレクト
      return NextResponse.redirect(new URL('/', origin));
    }
  }

  // コードなし、または他の問題が発生した場合は、ログインページにリダイレクト
  return NextResponse.redirect(new URL('/', origin));
} 