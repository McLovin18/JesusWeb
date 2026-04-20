"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/firebase-auth";
import { getAuth } from "firebase/auth";

export default function AdminLoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Auto-dismiss alert
  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(t);
  }, [alert]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || !password) {
      setAlert({ message: "Completa los campos", type: "error" });
      return;
    }

    try {
      setLoading(true);
      console.log("[ADMIN-LOGIN] Iniciando login con:", email);
      
      const result = await loginUser(email, password);
      console.log("[ADMIN-LOGIN] Resultado de loginUser:", result);
      
      if (result.success) {
        // Verificar que sea admin mediante el custom claim
        const auth = getAuth();
        const user = auth.currentUser;
        
        console.log("[ADMIN-LOGIN] Usuario autenticado:", user?.email);
        
        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        console.log("[ADMIN-LOGIN] Verificando custom claims...");
        const idTokenResult = await user.getIdTokenResult();
        const isAdmin = idTokenResult.claims.admin === true;

        console.log("[ADMIN-LOGIN] Custom claims:", idTokenResult.claims);
        console.log("[ADMIN-LOGIN] ¿Es admin?", isAdmin);

        if (!isAdmin) {
          console.error("[ADMIN-LOGIN] Usuario no es admin:", email);
          setAlert({ 
            message: "❌ No tienes permisos de administrador. Contacta al propietario.", 
            type: "error" 
          });
          setPassword("");
          // Logout
          try {
            await import("@/lib/firebase-auth").then((m) => m.logoutUser());
          } catch {}
          return;
        }

        setAlert({ 
          message: `✓ Bienvenido ${user.displayName || email}`, 
          type: "success" 
        });

        // Crear sesión
        const idToken = result.idToken;
        console.log("[ADMIN-LOGIN] Enviando token a API...");
        
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        console.log("[ADMIN-LOGIN] Respuesta de API:", res.status);
        const data = await res.json();
        console.log("[ADMIN-LOGIN] Data de API:", data);

        if (!res.ok) throw new Error(data.error || "No se pudo crear la sesión");

        // Redirigir al dashboard admin
        console.log("[ADMIN-LOGIN] Login exitoso, redirigiendo a /admin");
        setTimeout(() => {
          router.push("/admin");
        }, 500);
      }
    } catch (error: any) {
      const errorMsg = error.message || "Error al iniciar sesión";
      console.error("[ADMIN-LOGIN] Error:", errorMsg);
      setAlert({ message: errorMsg, type: "error" });
      setPassword("");
      
      try {
        await import("@/lib/firebase-auth").then((m) => m.logoutUser());
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 " +
    "bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white " +
    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent " +
    "placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-white">
      
      {/* Logo + Header */}
      <div className="w-full max-w-md mx-auto px-4 pt-16 pb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 mb-6 shadow-lg shadow-purple-500/40">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
          Jesus Web
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base">
          Panel de Administrador
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto px-4 pb-16 flex-1 flex flex-col justify-start">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">

          {/* Alert */}
          {alert && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-start gap-3 ${
                alert.type === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-100 dark:border-green-800"
                  : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-100 dark:border-red-800"
              }`}
            >
              <span className="text-base leading-none mt-0.5">
                {alert.type === "success" ? "✓" : "!"}
              </span>
              {alert.message}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                📧 Correo
              </label>
              <input
                type="email"
                placeholder="admin@jesusweb.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                🔑 Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className={inputClass + " pr-12"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 active:from-purple-700 active:to-indigo-800 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-purple-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Ingresar</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-3">
              ⚠️ <span className="font-semibold">Acceso restringido</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
              Solo administradores pueden acceder a esta sección.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a inicio
          </a>
        </div>
      </div>
    </div>
  );
}
