"use client";

import { useState } from "react";
import Header from "../Header";

interface LayoutClientProps {
  children: React.ReactNode;
}

export default function LayoutClient({ children }: LayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex">
        {/* サイドバーコンポーネントがあれば、ここに追加できます */}
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
