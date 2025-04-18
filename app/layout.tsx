import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import LayoutClient from "./components/LayoutClient";

const inter = Inter({ subsets: ["latin"] });

// メタデータはクライアントコンポーネントでは動作しないため、別のエクスポートにします
export const metadata: Metadata = {
  title: "Inspire Speech",
  description: "AI-powered inspiration app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LayoutClient>{children}</LayoutClient>
        </AuthProvider>
      </body>
    </html>
  );
}
