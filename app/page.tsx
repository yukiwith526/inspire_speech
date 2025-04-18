"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  startStreaming,
  cleanupAudio,
  type AudioAPIErrorResponse,
} from "./utils/start_streaming";
import * as React from "react";
import { SelectDemo, selectedVoiceId } from "./ui/select";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import type { ChatHistory } from "@/lib/supabase";
import { PlusCircle, Send, Sparkles, AlertTriangle, X } from "lucide-react";
import Header from "./Header";
import Sidebar from "./components/Sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function Home() {
  const [text, setText] = useState(
    "Life without inspiration is like a blank canvas."
  );
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [apiError, setApiError] = useState<AudioAPIErrorResponse | null>(null);

  // コンポーネントのマウント状態を管理
  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      // コンポーネントのアンマウント時にオーディオをクリーンアップ
      cleanupAudio();
    };
  }, []);

  // サイドバーの開閉を制御する関数
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    }
  }, [user, isLoading, router]);

  const fetchChatHistory = async () => {
    // サイドバーコンポーネントで実装するため、ここでは空の関数にしておく
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleNewChat = () => {
    setText("Life without inspiration is like a blank canvas.");
    setResponse("");
  };

  const handleDeleteChat = async (id: string) => {
    if (!user) {
      router.push("/auth");
      return;
    }

    setDeleteLoading(id);
    try {
      const { error } = await supabase
        .from("chat_history")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting chat:", error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  // エラーメッセージを閉じる処理
  const dismissError = () => {
    setApiError(null);
  };

  const handleSubmit = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }

    if (audioPlaying) {
      console.log("Audio already playing, please wait");
      return;
    }

    if (!text.trim()) {
      setApiError({
        type: "api_error",
        message: "テキストが空です。メッセージを入力してください。",
        code: "empty_text",
      });
      return;
    }

    setApiError(null); // エラーを消去
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, voiceId: selectedVoiceId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setApiError({
          type: "api_error",
          message: "サーバーとの通信に失敗しました。",
          code: res.status,
          details: errorData.error || res.statusText,
        });
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Success:", data);

      setResponse(data.sophia_response);

      // Save to chat history
      const { error } = await supabase.from("chat_history").insert({
        user_id: user.id,
        input_text: text,
        response: data.sophia_response,
        voice_id: selectedVoiceId,
      });

      if (error) {
        console.error("Error saving chat history:", error);
      }

      // Start streaming the response as audio
      setAudioPlaying(true);
      const streamResult = await startStreaming(
        data.sophia_response,
        selectedVoiceId
      );
      if (!streamResult.success && streamResult.error) {
        setApiError(streamResult.error);
      }
      setAudioPlaying(false);
    } catch (error) {
      console.error("Error:", error);
      if (!apiError) {
        setApiError({
          type: "unknown_error",
          message: "予期しないエラーが発生しました。もう一度お試しください。",
          details: error instanceof Error ? error.message : String(error),
        });
      }
      setAudioPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryItemClick = async (item: ChatHistory) => {
    if (audioPlaying) {
      console.log("Audio already playing, please wait");
      return;
    }

    setApiError(null); // エラーを消去
    setText(item.input_text);
    setResponse(item.response);

    setAudioPlaying(true);
    try {
      const streamResult = await startStreaming(item.response, item.voice_id);
      if (!streamResult.success && streamResult.error) {
        setApiError(streamResult.error);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setApiError({
        type: "audio_error",
        message: "音声の再生中にエラーが発生しました。",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setAudioPlaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-zinc-900">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {mounted && (
        <>
          <Header toggleSidebar={toggleSidebar} />
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onSelectHistory={handleHistoryItemClick}
            onDeleteChat={handleDeleteChat}
            deleteLoading={deleteLoading}
          />
        </>
      )}

      <main className="pt-16 min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 text-white">
        <div className="max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-2xl space-y-8">
            {/* ヘッダー部分 */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold flex items-center">
                <Sparkles className="text-blue-400 mr-2" size={20} />
                <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  インスピレーションを引き出す
                </span>
              </h1>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                className="flex items-center gap-1 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
              >
                <PlusCircle size={16} />
                新しいチャット
              </Button>
            </div>

            {/* エラーメッセージ表示 */}
            {apiError && (
              <Alert
                variant="destructive"
                className="bg-red-950/50 border-red-900 text-red-100"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                <div className="flex-1">
                  <AlertTitle className="flex items-center justify-between">
                    <span>エラーが発生しました</span>
                    <Button
                      variant="ghost"
                      className="h-6 w-6 p-0 rounded-full text-red-200 hover:text-white hover:bg-red-900"
                      onClick={dismissError}
                    >
                      <X size={14} />
                    </Button>
                  </AlertTitle>
                  <AlertDescription>
                    <p>{apiError.message}</p>
                    {apiError.details && (
                      <p className="text-xs mt-1 text-red-300">
                        {apiError.details}
                      </p>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* メインコンテンツ */}
            <div className="w-full space-y-6">
              {/* 入力部分 */}
              <div className="relative rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800/50 backdrop-blur-sm shadow-lg">
                <Textarea
                  placeholder="メッセージを入力してください..."
                  className="min-h-[120px] p-4 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white resize-none"
                  value={text}
                  onChange={handleChange}
                />
                <div className="p-3 border-t border-zinc-700 bg-zinc-800/80 flex items-center justify-between">
                  <SelectDemo />
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || audioPlaying || !text.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-white rounded-full"></div>
                        処理中...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        送信
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* レスポンス部分 */}
              {response && (
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 backdrop-blur-sm shadow-lg p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 flex items-center justify-center">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <h2 className="font-medium text-gray-200">Inspire AI</h2>
                  </div>
                  <p className="text-gray-200 leading-relaxed">{response}</p>
                  {audioPlaying && (
                    <div className="mt-3 flex items-center text-blue-400 text-sm">
                      <div className="mr-2 flex space-x-1">
                        <div
                          className="w-1 h-3 bg-blue-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-1 h-4 bg-blue-400 rounded-full animate-pulse"
                          style={{ animationDelay: "100ms" }}
                        ></div>
                        <div
                          className="w-1 h-5 bg-blue-400 rounded-full animate-pulse"
                          style={{ animationDelay: "200ms" }}
                        ></div>
                        <div
                          className="w-1 h-3 bg-blue-400 rounded-full animate-pulse"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                      音声再生中...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
