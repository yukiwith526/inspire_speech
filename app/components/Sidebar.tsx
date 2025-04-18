"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User, X, Trash2, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { ChatHistory } from "@/lib/supabase";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHistory: (item: ChatHistory) => void;
  onDeleteChat: (id: string) => void;
  deleteLoading: string | null;
}

export default function Sidebar({
  isOpen,
  onClose,
  onSelectHistory,
  onDeleteChat,
  deleteLoading,
}: SidebarProps) {
  const { user, signOut, isLoading } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // サイドバーの表示状態を管理
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // アニメーション完了後に非表示にする
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ユーザーが認証されていて、サイドバーが表示されているときに履歴を読み込む
  useEffect(() => {
    if (user && isVisible) {
      fetchChatHistory();
    }
  }, [user, isVisible]);

  // クリックイベントのハンドラー
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const fetchChatHistory = async () => {
    try {
      setHistoryLoading(true);
      const { data, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching chat history:", error);
      } else {
        setChatHistory(data as ChatHistory[]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  // サイドバーが非表示の場合は何もレンダリングしない
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-30 isolate">
      {/* オーバーレイ */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* サイドバー本体 */}
      <aside
        ref={sidebarRef}
        className={`absolute top-0 left-0 z-40 h-screen w-64 md:w-80 bg-zinc-900 text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* サイドバーヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            <h2 className="text-lg font-semibold">メニュー</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-300 hover:bg-zinc-800"
            >
              <X size={20} />
            </Button>
          </div>

          {/* ユーザー情報 */}
          {user ? (
            <div className="p-4 border-b border-zinc-700">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-full bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
              >
                <LogOut size={16} className="mr-2" />
                ログアウト
              </Button>
            </div>
          ) : (
            <div className="p-4 border-b border-zinc-700">
              <Link href="/auth">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                >
                  <User size={16} className="mr-2" />
                  ログイン
                </Button>
              </Link>
            </div>
          )}

          {/* チャット履歴 */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold mb-4 text-gray-300 flex items-center">
              <MessageSquare size={16} className="mr-2" />
              チャット履歴
            </h3>

            {historyLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
              </div>
            ) : chatHistory.length === 0 ? (
              <p className="text-gray-500 text-center">履歴はありません</p>
            ) : (
              <ul className="space-y-2">
                {chatHistory.map((item) => (
                  <li
                    key={item.id}
                    className="p-3 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors relative group"
                  >
                    <div
                      className="cursor-pointer pr-8"
                      onClick={() => {
                        onSelectHistory(item);
                        onClose();
                      }}
                    >
                      <p className="font-medium text-sm text-gray-200 truncate">
                        {item.input_text}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {item.response}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(item.id);
                      }}
                      disabled={deleteLoading === item.id}
                      className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {deleteLoading === item.id ? (
                        <div className="animate-spin h-4 w-4 border-t-2 border-red-400 rounded-full"></div>
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* フッター */}
          <div className="p-3 text-xs text-center text-gray-500 border-t border-zinc-700">
            © 2024 Inspire Speech
          </div>
        </div>
      </aside>
    </div>
  );
}
