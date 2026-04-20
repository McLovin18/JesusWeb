"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    masterPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
    masterPassword: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: "password" | "confirmPassword" | "masterPassword") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    // Validaciones
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.masterPassword) {
      setAlert({ message: "Completa todos los campos", type: "error" });
      return;
    }

    if (!formData.email.includes("@")) {
      setAlert({ message: "Email inválido", type: "error" });
      return;
    }

    if (formData.password.length < 6) {
      setAlert({ message: "La contraseña debe tener al menos 6 caracteres", type: "error" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAlert({ message: "Las contraseñas no coinciden", type: "error" });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/create-first-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          masterPassword: formData.masterPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear administrador");
      }

      setAlert({
        message: "✓ Administrador creado exitosamente. Redirigiendo...",
        type: "success",
      });

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push("/admin-login");
      }, 2000);
    } catch (error: any) {
      setAlert({
        message: error.message || "Error al crear administrador",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({
    label,
    name,
    field,
  }: {
    label: string;
    name: string;
    field: "password" | "confirmPassword" | "masterPassword";
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPasswords[field] ? "text" : "password"}
          name={name}
          value={formData[field as keyof typeof formData]}
          onChange={handleChange}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 transition-all duration-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400 pr-12"
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility(field)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          tabIndex={-1}
          disabled={loading}
        >
          {showPasswords[field] ? (
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
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-600 to-transparent opacity-10 dark:opacity-5 rounded-full blur-3xl -z-10" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 mb-6 shadow-lg shadow-green-500/30 dark:shadow-green-500/20">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Crear <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">Admin</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base font-medium">
            Configura el primer administrador del sistema
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Email del administrador
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@tusite.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 transition-all duration-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <PasswordInput label="Contraseña" name="password" field="password" />

              {/* Confirm Password */}
              <PasswordInput
                label="Confirmar contraseña"
                name="confirmPassword"
                field="confirmPassword"
              />

              {/* Master Password */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
                  ⚠️ Esta acción requiere contraseña maestra. Contacta al desarrollador.
                </p>
                <PasswordInput
                  label="Contraseña maestra"
                  name="masterPassword"
                  field="masterPassword"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 active:from-green-800 active:to-green-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed mt-7 text-base font-semibold"
              >
                {loading ? "Creando administrador..." : "Crear administrador"}
              </button>
            </form>

            {/* Help text */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>💡 Nota:</strong> Solo se puede crear un administrador. Después deberás usar la página de login para acceder.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <a
            href="/admin-login"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            ¿Ya tienes admin? Ir a login →
          </a>
        </div>
      </div>
    </div>
  );
}
