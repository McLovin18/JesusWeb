"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import BottomBar from "@/components/BottomBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar role="admin" />
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>
      <BottomBar role="admin" />
    </div>
  );
}
