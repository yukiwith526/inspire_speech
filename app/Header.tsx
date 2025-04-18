"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Menu } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { user, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-zinc-900 text-white fixed top-0 left-0 w-full z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-white hover:bg-zinc-800"
            >
              <Menu size={20} />
            </Button>
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
            >
              Inspire Speech
            </Link>
          </div>
          <div>
            {!isLoading && user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-1 text-sm text-gray-300">
                  <User size={16} className="text-gray-300" />
                  <span className="hidden sm:inline">{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  size="sm"
                  className="flex items-center gap-1 text-white hover:bg-zinc-800"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">ログアウト</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
