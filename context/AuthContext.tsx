"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User, Provider, AuthError } from "@supabase/supabase-js";

// エラー応答の型
export type AuthErrorResponse = {
  code: string;
  message: string;
  detail?: string;
};

// エラーコードマッピング
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // 一般的なエラー
  user_not_found: "ユーザーが見つかりません。",
  invalid_credentials: "メールアドレスまたはパスワードが正しくありません。",
  email_not_confirmed:
    "メールアドレスが確認されていません。メールを確認してください。",
  invalid_login_credentials: "ログイン情報が無効です。",

  // ソーシャルログインのエラー
  provider_not_enabled: "このログインプロバイダーは現在有効になっていません。",
  validation_failed: "認証プロバイダーの検証に失敗しました。",
  unsupported_provider: "サポートされていない認証プロバイダーです。",
  invalid_provider: "無効な認証プロバイダーです。",
  redirect_url_not_allowed: "リダイレクトURLが許可されていません。",

  // サインアップのエラー
  user_already_exists: "このメールアドレスは既に登録されています。",
  weak_password:
    "パスワードが脆弱です。より強力なパスワードを設定してください。",

  // その他のエラー
  server_error:
    "サーバーエラーが発生しました。しばらくしてからもう一度お試しください。",
  rate_limit_exceeded:
    "短時間に多くのリクエストがありました。しばらくしてからもう一度お試しください。",
  network_error:
    "ネットワークエラーが発生しました。インターネット接続を確認してください。",
  unknown_error: "予期しないエラーが発生しました。もう一度お試しください。",
};

// エラーメッセージを取得する関数
export const getErrorMessage = (
  error: AuthError | Error | null
): AuthErrorResponse => {
  if (!error) {
    return {
      code: "unknown_error",
      message: AUTH_ERROR_MESSAGES["unknown_error"],
    };
  }

  const errorMsg = error.message || "";
  let errorCode = "unknown_error";
  let detail = "";

  // Supabaseエラーの場合
  if ("code" in error && typeof error.code === "string") {
    if (error.code === "400") {
      // 400エラーのパターンを検出
      if (errorMsg.includes("provider is not enabled")) {
        errorCode = "provider_not_enabled";
      } else if (errorMsg.includes("validation_failed")) {
        errorCode = "validation_failed";
      } else if (errorMsg.includes("redirect_url_not_allowed")) {
        errorCode = "redirect_url_not_allowed";
      }
    } else if (error.code === "401") {
      errorCode = "invalid_credentials";
    } else if (error.code === "422") {
      if (errorMsg.includes("already registered")) {
        errorCode = "user_already_exists";
      } else if (errorMsg.includes("weak password")) {
        errorCode = "weak_password";
      }
    } else if (error.code === "429") {
      errorCode = "rate_limit_exceeded";
    } else if (error.code === "500") {
      errorCode = "server_error";
    }

    // エラーの詳細情報があれば保存
    if ("details" in error && typeof error.details === "string") {
      detail = error.details;
    }
  } else {
    // 一般的なErrorオブジェクト
    if (errorMsg.includes("network")) {
      errorCode = "network_error";
    }
  }

  // カスタムエラーパターンのチェック
  if (
    errorMsg.includes("User not found") ||
    errorMsg.includes("user not found")
  ) {
    errorCode = "user_not_found";
  } else if (errorMsg.includes("Email not confirmed")) {
    errorCode = "email_not_confirmed";
  } else if (errorMsg.includes("Invalid login credentials")) {
    errorCode = "invalid_login_credentials";
  }

  return {
    code: errorCode,
    message: AUTH_ERROR_MESSAGES[errorCode] || errorMsg,
    detail: detail || undefined,
  };
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthErrorResponse | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: AuthErrorResponse | null; user: User | null }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (
    provider: Provider
  ) => Promise<{ error: AuthErrorResponse | null }>;
  checkUserExists: (
    email: string
  ) => Promise<{ exists: boolean; error: AuthErrorResponse | null }>;
  resetPassword: (
    email: string
  ) => Promise<{ error: AuthErrorResponse | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // パスワードリセット関数
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return { error: error ? getErrorMessage(error) : null };
    } catch (err) {
      console.error("Password reset error:", err);
      return { error: getErrorMessage(err as Error) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: error ? getErrorMessage(error) : null };
    } catch (err) {
      console.error("Login error:", err);
      return { error: getErrorMessage(err as Error) };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email: email,
          },
        },
      });

      if (error) {
        console.error("Supabase signup error:", error);
        return { error: getErrorMessage(error), user: null };
      }

      return { error: null, user: data?.user || null };
    } catch (err) {
      console.error("Unexpected signup error:", err);
      return {
        error: getErrorMessage(err as Error),
        user: null,
      };
    }
  };

  const signInWithOAuth = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error: error ? getErrorMessage(error) : null };
    } catch (err) {
      console.error("OAuth sign in error:", err);
      return { error: getErrorMessage(err as Error) };
    }
  };

  const checkUserExists = async (email: string) => {
    try {
      // OTPサインインを試みることでユーザーの存在を確認
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          // OTPを実際に送信しないようにダミーのリダイレクトURLを設定
          emailRedirectTo: `${window.location.origin}/auth/dummy-redirect-that-wont-be-used`,
        },
      });

      // エラーメッセージが「ユーザーが見つからない」などの場合は存在しない
      const userNotFoundErrors = [
        "Invalid login credentials",
        "Email not confirmed",
        "User not found",
        "No user found",
      ];

      if (
        error &&
        userNotFoundErrors.some((msg) => error.message.includes(msg))
      ) {
        return { exists: false, error: null };
      }

      // エラーがなかったか、別種のエラーの場合はユーザーが存在する可能性が高い
      return { exists: true, error: null };
    } catch (err) {
      console.error("Check user exists error:", err);
      return {
        exists: false,
        error: getErrorMessage(err as Error),
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    checkUserExists,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
