"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp } = useAuth();

  // URLからエラーパラメータを検出
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "session_error") {
      setError(
        "認証セッションに問題が発生しました。もう一度ログインしてください。"
      );
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
          throw new Error(error.message || "ログインに失敗しました。");
        }
        router.push("/");
      } else {
        // Password validation
        if (password.length < 6) {
          setError("パスワードは6文字以上にしてください。");
          setLoading(false);
          return;
        }

        const { error, user } = await signUp(email, password);
        if (error) {
          console.error("Signup error:", error);
          throw new Error(error.message || "アカウント作成に失敗しました。");
        }

        // If we get here with no error, it's likely waiting for email confirmation
        setSuccess(
          "確認メールを送信しました。メールを確認してアカウントを有効化してください。"
        );
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let errorMsg = err.message || "認証中にエラーが発生しました。";

      // Check for common Supabase error messages and provide better feedback
      if (errorMsg.includes("already registered")) {
        errorMsg = "このメールアドレスは既に登録されています。";
      } else if (errorMsg.includes("invalid login")) {
        errorMsg = "メールアドレスまたはパスワードが正しくありません。";
      } else if (errorMsg.includes("Database error")) {
        errorMsg =
          "サーバーエラーが発生しました。しばらくしてからもう一度お試しください。";
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
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
            AIがあなたのインスピレーションを引き出します
          </p>
        </div>

        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-bold mb-6 text-center">
            {isLogin ? "ログイン" : "アカウント作成"}
          </h2>

          {error && (
            <div
              className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded mb-4"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div
              className="bg-green-900/30 border border-green-800 text-green-200 px-4 py-3 rounded mb-4"
              role="alert"
            >
              <span className="block sm:inline">{success}</span>
            </div>
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
