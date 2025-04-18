# inspire_speech

## Overview

This project uses ElevenLabs for text-to-speech (TTS) and OpenAI's GPT API to create an interactive conversational application.

## Stack

- **Next.js**: A React framework for server-side rendering and static site generation.
- **Shadcn**: A UI component library.
- **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python 3.6+.

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yukiwith5267/inspire_speech
   cd inspire_speech
   ```

2. **Install frontend dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your API keys:
   You can get your API keys from the [OpenAI docs](https://platform.openai.com/docs/quickstart) and the [ElevenLabs docs](https://docs.elevenlabs.io/).

   ```plaintext
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_ELEVEN_API_KEY=your_eleven_api_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Deployment

### Frontend

The frontend is deployed on [Vercel](https://vercel.com/).

### Backend

The backend is hosted on a Raspberry Pi using ngrok.

1. **Install backend dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

2. **Run the FastAPI server:**

   ```bash
   uvicorn index:app --reload --port 8080
   ```

3. **Expose the backend using ngrok:**
   ```bash
   ngrok http 8080
   ```

## ソーシャルログイン設定（Google、GitHub）

1. Supabase ダッシュボードにログイン
2. プロジェクト > Authentication > Providers に移動
3. 各プロバイダーの設定:

### Google

1. Google Cloud Console で新しいプロジェクトを作成
2. OAuth 同意画面を設定（外部ユーザータイプ）
3. 認証情報 > OAuth 2.0 クライアント ID 作成
4. 承認済みのリダイレクト URI に`https://[あなたのプロジェクトID].supabase.co/auth/v1/callback`を追加
5. クライアント ID とクライアントシークレットを Supabase 設定に入力
6. Google プロバイダーを有効化

### GitHub

1. GitHub アカウント > Settings > Developer Settings > OAuth Apps
2. 新しい OAuth アプリケーションを登録
3. Authorization callback URL に`https://[あなたのプロジェクトID].supabase.co/auth/v1/callback`を追加
4. ClientID と Client Secret を取得
5. Supabase プロジェクト設定で GitHub プロバイダーを有効化し、キーを入力

### Facebook

1. [Facebook Developers](https://developers.facebook.com/) にアクセスし、アカウント作成・ログイン
2. 「マイアプリ」から新しいアプリを作成（タイプ：「消費者」または「ビジネス」）
3. 左側のメニューから「Facebook Login」>「設定」に移動
4. 「有効な OAuth リダイレクト URI」に`https://[あなたのプロジェクトID].supabase.co/auth/v1/callback`を追加
5. 「基本設定」から「アプリ ID」と「アプリシークレット」を取得
6. Supabase ダッシュボードの「Authentication > Providers」で Facebook を有効化
7. 取得したアプリ ID とシークレットを入力して保存
