"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/firebase-auth";

interface BottomBarProps {
  role?: string;
}

export default function BottomBar({ role = "client" }: BottomBarProps) {
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setUserName(user.displayName || "Admin");
        setUserEmail(user.email || "");
      }
    });
  }, []);

  const currentTime = new Date().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <footer className="fixed bottom-0 right-0 left-64 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shadow-sm">
      
      {/* Left: Status Info */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Sistema en línea
          </span>
        </div>
        <span className="text-sm text-slate-400 dark:text-slate-500">
          {currentTime}
        </span>
      </div>

      {/* Right: User Info */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {userName}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {userEmail}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
          {userName?.charAt(0) || "A"}
        </div>
      </div>
    </footer>
  );
}
