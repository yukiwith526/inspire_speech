"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, type AuthErrorResponse } from "@/context/AuthContext";
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  Github,
  Facebook,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// エラーメッセージのマッピング
const errorMessages: Record<string, string> = {
  provider_not_enabled:
    "このプロバイダーは現在有効になっていません。Supabaseの設定を確認してください。",
  validation_failed:
    "認証プロバイダーの検証に失敗しました。設定を確認してください。",
  invalid_provider: "無効な認証プロバイダーです。",
  redirect_url_not_allowed:
    "リダイレクトURLが許可されていません。設定を確認してください。",
  invalid_redirect_url: "無効なリダイレクトURLです。",
};

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<AuthErrorResponse | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, signInWithOAuth, checkUserExists } = useAuth();

  // URLからエラーパラメータを検出
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "session_error") {
      setError({
        code: "session_error",
        message:
          "認証セッションに問題が発生しました。もう一度ログインしてください。",
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          console.error("Login error:", error);
          setError(error);
          return;
        }
        router.push("/");
      } else {
        // Password validation
        if (password.length < 6) {
          setError({
            code: "weak_password",
            message: "パスワードは6文字以上にしてください。",
          });
          setLoading(false);
          return;
        }

        // 既存ユーザーチェック
        const { exists, error: checkError } = await checkUserExists(email);
        if (checkError) {
          console.error("User check error:", checkError);
          setError(checkError);
          setLoading(false);
          return;
        }

        if (exists) {
          setError({
            code: "user_already_exists",
            message:
              "このメールアドレスは既に登録されています。ログインしてください。",
          });
          setIsLogin(true); // ログインモードに切り替え
          setLoading(false);
          return;
        }

        const { error, user } = await signUp(email, password);
        if (error) {
          console.error("Signup error:", error);
          setError(error);
          return;
        }

        // If we get here with no error, it's likely waiting for email confirmation
        setSuccess(
          "確認メールを送信しました。メールを確認してアカウントを有効化してください。"
        );
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError({
        code: "unknown_error",
        message: "予期しないエラーが発生しました。もう一度お試しください。",
        detail: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (
    provider: "google" | "github" | "facebook"
  ) => {
    setSocialLoading(provider);
    setError(null); // エラーメッセージをクリア

    try {
      const { error } = await signInWithOAuth(provider);
      if (error) {
        console.error(`${provider} sign in error:`, error);
        setError(error);
      }
    } catch (err: any) {
      console.error(`${provider} sign in error:`, err);
      setError({
        code: "unknown_error",
        message: `${
          provider === "google"
            ? "Google"
            : provider === "github"
            ? "GitHub"
            : "Facebook"
        }ログインに予期しないエラーが発生しました。もう一度お試しください。`,
        detail: err.message,
      });
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 text-white p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Inspire Speech
            </span>
          </Link>
          <p className="mt-2 text-zinc-400">
            インスピレーションを引き出すAI会話アプリ
          </p>
        </div>

        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-bold mb-6 text-center">
            {isLogin ? "ログイン" : "アカウント作成"}
          </h2>

          {error && (
            <Alert
              variant="destructive"
              className="bg-red-950/50 border-red-900 text-red-100 mb-4"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              <div>
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>
                  <p>{error.message}</p>
                  {error.detail && (
                    <p className="text-xs mt-1 text-red-300">{error.detail}</p>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-950/50 border-green-900 text-green-100 mb-4">
              <div>
                <AlertTitle>成功</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium mb-1 text-zinc-300"
                htmlFor="email"
              >
                メールアドレス
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail size={16} />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  required
                  className="pl-10 border-zinc-700 bg-zinc-800/50 text-white"
                  placeholder="your-email@example.com"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 text-zinc-300"
                htmlFor="password"
              >
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={16} />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  required
                  minLength={6}
                  className="pl-10 border-zinc-700 bg-zinc-800/50 text-white"
                  placeholder={isLogin ? "パスワード" : "6文字以上のパスワード"}
                />
              </div>
              {!isLogin && (
                <p className="text-xs text-zinc-400 mt-1">
                  パスワードは6文字以上にしてください
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  <span>処理中...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>{isLogin ? "ログイン" : "アカウント作成"}</span>
                  <ArrowRight size={16} />
                </div>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-600"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-800 px-2 text-zinc-400">または</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white"
              onClick={() => handleOAuthSignIn("google")}
              disabled={!!socialLoading}
            >
              {socialLoading === "google" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mx-auto"></div>
              ) : (
                <div className="flex items-center justify-center">
                  <FcGoogle className="mr-2 h-5 w-5" />
                  <span>Googleでログイン</span>
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white"
              onClick={() => handleOAuthSignIn("github")}
              disabled={!!socialLoading}
            >
              {socialLoading === "github" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mx-auto"></div>
              ) : (
                <div className="flex items-center justify-center">
                  <Github className="mr-2 h-5 w-5" />
                  <span>GitHubでログイン</span>
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white"
              onClick={() => handleOAuthSignIn("facebook")}
              disabled={!!socialLoading}
            >
              {socialLoading === "facebook" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mx-auto"></div>
              ) : (
                <div className="flex items-center justify-center">
                  <Facebook className="mr-2 h-5 w-5 text-[#1877F2]" />
                  <span>Facebookでログイン</span>
                </div>
              )}
            </Button>
          </div>

          {error && error.code === "provider_not_enabled" && (
            <div className="mt-4 text-center">
              <Link
                href="/auth/troubleshooting"
                className="text-sm text-blue-400 hover:underline"
              >
                ソーシャルログインの設定方法を確認する
              </Link>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-zinc-700 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isLogin
                ? "アカウントをお持ちでない方はこちら"
                : "ログインはこちら"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-zinc-500 text-xs">
          © 2024 Inspire Speech. All rights reserved.
        </div>
      </div>
    </div>
  );
}
