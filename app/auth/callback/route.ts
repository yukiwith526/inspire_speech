import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (!code) {
    console.warn('Auth callback called without code');
    return NextResponse.redirect(new URL('/auth?error=no_code', origin));
  }

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // コードをセッションに交換
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    // エラー確認
    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL(`/auth?error=${error.name || 'session_error'}`, origin));
    }
    
    try {
      // ユーザーがログインしているか確認
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user after code exchange:', userError);
        return NextResponse.redirect(new URL('/auth?error=user_error', origin));
      }
      
      if (user) {
        // ログイン済みならホームページへリダイレクト
        return NextResponse.redirect(new URL('/', origin));
      }
    } catch (userCheckError) {
      console.error('Exception in user check:', userCheckError);
      return NextResponse.redirect(new URL('/auth?error=user_check_error', origin));
    }
    
    // ユーザーが見つからなかった場合
    return NextResponse.redirect(new URL('/auth?error=no_user', origin));
  } catch (err) {
    console.error('Unhandled exception in auth callback:', err);
    return NextResponse.redirect(new URL('/auth?error=server_error', origin));
  }
} 