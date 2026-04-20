"use client";

import { useRouter, usePathname } from "next/navigation";
import { logoutUser } from "@/lib/firebase-auth";
import { useState } from "react";

interface SidebarProps {
  role?: string;
}

export default function Sidebar({ role = "client" }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const adminMenuItems = [
    { label: "Dashboard", icon: "📊", href: "/admin" },
    { label: "Inventario", icon: "📦", href: "/admin/inventario" },
    { label: "Blogs", icon: "📝", href: "/admin/blogs" },
    { label: "Órdenes", icon: "🛒", href: "/admin/ordenes" },
    { label: "Usuarios", icon: "👥", href: "/admin/usuarios" },
  ];

  const menuItems = role === "admin" ? adminMenuItems : [];

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white border-r border-slate-800 flex flex-col">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <span className="text-lg">⚙️</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">Jesus Web</h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/50"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium text-sm">
            {loading ? "Cerrando..." : "Cerrar sesión"}
          </span>
        </button>
        <p className="text-xs text-slate-500 text-center px-2">
          v1.0 Admin Panel
        </p>
      </div>
    </aside>
  );
}
