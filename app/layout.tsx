import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import Header from "./Header";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inspire Speech",
  description: "AI-powered inspiration app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header toggleSidebar={toggleSidebar} />
          <div className="flex">
            {/* サイドバーコンポーネントがあれば、ここに追加できます */}
            <main className="flex-1">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
