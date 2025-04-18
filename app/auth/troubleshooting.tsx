"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Github, Facebook, AlertTriangle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export default function OAuthTroubleshooting() {
  const [activeTab, setActiveTab] = useState<string>("google");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        Supabase ソーシャルログイン トラブルシューティング
      </h1>

      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertTitle>エラー: provider is not enabled</AlertTitle>
        <AlertDescription>
          このエラーは、Supabaseダッシュボードで対象のプロバイダーが有効化されていないか、
          適切に設定されていない場合に発生します。
        </AlertDescription>
      </Alert>

      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${
            activeTab === "google"
              ? "border-b-2 border-blue-500 font-semibold"
              : ""
          }`}
          onClick={() => setActiveTab("google")}
        >
          Google
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "github"
              ? "border-b-2 border-blue-500 font-semibold"
              : ""
          }`}
          onClick={() => setActiveTab("github")}
        >
          GitHub
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "facebook"
              ? "border-b-2 border-blue-500 font-semibold"
              : ""
          }`}
          onClick={() => setActiveTab("facebook")}
        >
          Facebook
        </button>
      </div>

      {activeTab === "google" && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FcGoogle className="mr-2 h-6 w-6" />
            Google認証の設定
          </h2>

          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Google Cloud Consoleにアクセス</strong>
              <p>
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  className="text-blue-500 hover:underline"
                >
                  Google Cloud Console
                </a>
                にアクセスし、プロジェクトを作成または選択します。
              </p>
            </li>
            <li>
              <strong>OAuth同意画面の設定</strong>
              <p>
                左側のメニューから「APIとサービス」→「OAuth同意画面」を選択し、設定します。
              </p>
              <p>User Typeは「外部」を選択します。</p>
            </li>
            <li>
              <strong>認証情報の作成</strong>
              <p>
                「認証情報」→「認証情報を作成」→「OAuth クライアント
                ID」を選択します。
              </p>
              <p>
                アプリケーションタイプは「ウェブアプリケーション」を選択します。
              </p>
            </li>
            <li>
              <strong>リダイレクトURIの設定</strong>
              <p>承認済みのリダイレクトURIに以下を追加します：</p>
              <code className="bg-gray-800 p-2 rounded block my-2">
                https://[プロジェクトID].supabase.co/auth/v1/callback
              </code>
            </li>
            <li>
              <strong>Supabaseでの設定</strong>
              <p>
                <a
                  href="https://app.supabase.com/"
                  target="_blank"
                  className="text-blue-500 hover:underline"
                >
                  Supabaseダッシュボード
                </a>
                にアクセスし、プロジェクトを選択します。
              </p>
              <p>「Authentication」→「Providers」→「Google」を選択します。</p>
              <p>
                「ENABLED」をオンにし、Client IDとClient
                Secretを入力して保存します。
              </p>
            </li>
          </ol>
        </div>
      )}

      {activeTab === "github" && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Github className="mr-2 h-6 w-6" />
            GitHub認証の設定
          </h2>

          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>GitHubでOAuthアプリを作成</strong>
              <p>
                <a
                  href="https://github.com/settings/developers"
                  target="_blank"
                  className="text-blue-500 hover:underline"
                >
                  GitHub Developer Settings
                </a>
                にアクセスし、「OAuth Apps」→「New OAuth App」を選択します。
              </p>
            </li>
            <li>
              <strong>アプリケーション情報の入力</strong>
              <p>Application nameとHomepage URLを入力します。</p>
              <p>Authorization callback URLに以下を入力します：</p>
              <code className="bg-gray-800 p-2 rounded block my-2">
                https://[プロジェクトID].supabase.co/auth/v1/callback
              </code>
            </li>
            <li>
              <strong>Client IDとClient Secretの取得</strong>
              <p>
                アプリケーションを登録すると、Client IDとClient
                Secretが表示されます。
              </p>
              <p>
                Client Secretは「Generate a new client
                secret」ボタンで生成します。
              </p>
            </li>
            <li>
              <strong>Supabaseでの設定</strong>
              <p>
                Supabaseダッシュボードで「Authentication」→「Providers」→「GitHub」を選択します。
              </p>
              <p>
                「ENABLED」をオンにし、Client IDとClient
                Secretを入力して保存します。
              </p>
            </li>
          </ol>
        </div>
      )}

      {activeTab === "facebook" && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Facebook className="mr-2 h-6 w-6 text-[#1877F2]" />
            Facebook認証の設定
          </h2>

          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Facebook Developersでアプリを作成</strong>
              <p>
                <a
                  href="https://developers.facebook.com/"
                  target="_blank"
                  className="text-blue-500 hover:underline"
                >
                  Facebook Developers
                </a>
                にアクセスし、「マイアプリ」→「アプリを作成」を選択します。
              </p>
              <p>アプリタイプは「消費者向け」を選択します。</p>
            </li>
            <li>
              <strong>Facebook Loginの設定</strong>
              <p>
                左側のメニューから「製品の追加」→「Facebook
                Login」を選択します。
              </p>
              <p>「ウェブ」を選択し、ウェブサイトのURLを入力します。</p>
            </li>
            <li>
              <strong>有効なOAuthリダイレクトURIの設定</strong>
              <p>
                「Facebook
                Login」→「設定」に移動し、有効なOAuthリダイレクトURIに以下を追加します：
              </p>
              <code className="bg-gray-800 p-2 rounded block my-2">
                https://[プロジェクトID].supabase.co/auth/v1/callback
              </code>
            </li>
            <li>
              <strong>アプリIDとシークレットの取得</strong>
              <p>
                「設定」→「基本」で、アプリIDとアプリシークレットを確認できます。
              </p>
            </li>
            <li>
              <strong>Supabaseでの設定</strong>
              <p>
                Supabaseダッシュボードで「Authentication」→「Providers」→「Facebook」を選択します。
              </p>
              <p>
                「ENABLED」をオンにし、Client IDとClient
                Secretを入力して保存します。
              </p>
            </li>
            <li>
              <strong>アプリのステータスを「ライブ」に変更</strong>
              <p>
                Facebook
                Developersダッシュボードで「設定」→「基本」→「アプリモード」を「開発」から「ライブ」に変更します。
              </p>
              <p>
                これが完了するまでFacebookログインは限られたテストユーザーのみが利用可能です。
              </p>
            </li>
          </ol>
        </div>
      )}

      <div className="mt-8 p-4 bg-zinc-800 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">
          一般的なトラブルシューティング
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            リダイレクトURLが正確に設定されていることを確認してください（プロジェクトIDが正しいか）
          </li>
          <li>
            Client IDとClient Secretが正しく入力されていることを確認してください
          </li>
          <li>
            各プロバイダーのダッシュボードで「有効」になっていることを確認してください
          </li>
          <li>
            FacebookとGoogleの場合、「ドメイン検証」が必要な場合があります
          </li>
          <li>
            ブラウザのコンソールでネットワークタブを確認し、エラーの詳細を調べてください
          </li>
        </ul>
      </div>

      <div className="mt-6 flex justify-center">
        <Link href="/auth">
          <Button className="bg-blue-600 hover:bg-blue-700">
            ログインページに戻る
          </Button>
        </Link>
      </div>
    </div>
  );
}
