"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/firebase-auth";
import { Loading3DIcon } from "@/components/Loading3DIcon";

export default function AdminLoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rateLimitBlockedUntil, setRateLimitBlockedUntil] = useState<number | null>(null);
  const [rateLimitSecondsRemaining, setRateLimitSecondsRemaining] = useState<number>(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Auto-dismiss alert
  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(t);
  }, [alert]);

  // Rate limiting countdown
  useEffect(() => {
    if (!rateLimitBlockedUntil) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((rateLimitBlockedUntil - now) / 1000));
      
      setRateLimitSecondsRemaining(remaining);
      
      if (remaining <= 0) {
        setRateLimitBlockedUntil(null);
        setAlert({
          message: "✓ Puedes intentar iniciar sesión nuevamente",
          type: "success",
        });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [rateLimitBlockedUntil]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setAlert({ message: "Completa los campos", type: "error" });
      return;
    }
    
    if (rateLimitBlockedUntil && rateLimitSecondsRemaining > 0) {
      setAlert({
        message: `Espera ${rateLimitSecondsRemaining} segundos antes de intentar de nuevo.`,
        type: "error",
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log("[LOGIN] Iniciando login con:", email);
      
      const result = await loginUser(email, password);
      console.log("[LOGIN] Resultado de loginUser:", result);
      
      if (result.success) {
        setAlert({ message: `Bienvenido ${result.user.displayName || email}`, type: "success" });
        const idToken = result.idToken;
        
        console.log("[LOGIN] Enviando token a API...");
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        
        console.log("[LOGIN] Respuesta de API:", res.status);
        const data = await res.json();
        console.log("[LOGIN] Data de API:", data);
        
        if (!res.ok) throw new Error(data.error || "No se pudo crear la sesión");
        
        // Redirigir al admin
        setTimeout(() => router.push("/admin"), 1500);
      }
    } catch (error: any) {
      const errorMsg = error.message || "Error al iniciar sesión";
      console.error("[LOGIN] Error:", errorMsg);
      setAlert({ message: errorMsg, type: "error" });
      
      if (errorMsg.includes("Demasiados intentos")) {
        const secondsMatch = errorMsg.match(/(\d+)\s*segundos/);
        if (secondsMatch) {
          const secondsToWait = parseInt(secondsMatch[1], 10);
          const blockedUntil = Date.now() + (secondsToWait * 1000);
          setRateLimitBlockedUntil(blockedUntil);
          setRateLimitSecondsRemaining(secondsToWait);
        }
      }
      
      setPassword("");
      try {
        await import("@/lib/firebase-auth").then((m) => m.logoutUser());
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
    "placeholder:text-gray-500 transition-all duration-200 " +
    "dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Top decoration */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-600 to-transparent opacity-10 dark:opacity-5 rounded-full blur-3xl -z-10" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Admin <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base font-medium">
            Acceso exclusivo para administradores
          </p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-6">
          <div className="p-8">
            {/* Alert */}
            {alert && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in duration-300 ${
                  alert.type === "success"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800"
                    : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"
                }`}
              >
                <span className="text-lg font-bold">
                  {alert.type === "success" ? "✓" : "⚠"}
                </span>
                <span>{alert.message}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={inputClass}
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className={inputClass + " pr-12"}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    tabIndex={-1}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                disabled={loading || (rateLimitBlockedUntil !== null && rateLimitSecondsRemaining > 0)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:from-blue-800 active:to-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-7 text-base font-semibold"
              >
                {loading ? (
                  <>
                    <Loading3DIcon />
                    <span>Ingresando...</span>
                  </>
                ) : rateLimitBlockedUntil !== null && rateLimitSecondsRemaining > 0 ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Espera {rateLimitSecondsRemaining}s</span>
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
            🔒 Acceso restringido solo para administradores autorizados
          </p>
        </div>
      </div>
    </div>
  );
}