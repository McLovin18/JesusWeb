"use client";

import { useState, useEffect } from "react";

export default function UsuariosPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-extrabold mb-2">👥 Usuarios</h1>
          <p className="text-emerald-100">Gestión de clientes y permisos</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Módulo de Usuarios
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Próximamente disponible
            </p>
            <div className="inline-block bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 text-left">
              <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                ✓ Lista de Usuarios<br/>
                ✓ Roles y Permisos<br/>
                ✓ Estadísticas de Clientes<br/>
                ✓ Gestión de Acceso
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
