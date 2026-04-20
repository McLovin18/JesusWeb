"use client";

import React, { useState } from "react";
import { ProductReview } from "@/lib/reviews-types";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/useToast";

interface ReviewsComponentProps {
  productId: string;
  productName: string;
  reviews: ProductReview[];
  stats?: {
    total: number;
    aprobadas: number;
    pendientes: number;
    rechazadas: number;
    promedio: number;
  };
}

const StarInput = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <div className="flex gap-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <button
        key={i}
        onClick={() => onChange(i + 1)}
        className={`text-3xl transition-transform hover:scale-110 ${
          i < value ? "text-yellow-400" : "text-slate-300 dark:text-slate-600"
        }`}
      >
        ★
      </button>
    ))}
  </div>
);

export function ReviewsComponent({
  productId,
  productName,
  reviews,
  stats,
}: ReviewsComponentProps) {
  const { user, isLogged } = useUser();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    userName: user?.displayName || "",
    userEmail: user?.email || "",
    rating: 5,
    comment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userName.trim() || !formData.comment.trim()) {
      showToast("Por favor completa todos los campos", "error");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productName,
          userName: formData.userName.trim(),
          userEmail: formData.userEmail.trim(),
          rating: formData.rating,
          comment: formData.comment.trim(),
        }),
      });

      if (res.ok) {
        showToast("¡Gracias por tu reseña! Será revisada por el administrador.", "success");
        setSubmitSuccess(true);
        setFormData({ userName: "", userEmail: "", rating: 5, comment: "" });
        setShowForm(false);
        
        // Desaparecer el mensaje después de 5 segundos
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      } else {
        showToast("Error al enviar la reseña", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Error de conexión", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
      {/* Header con estadísticas */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            Reseñas del Producto
          </h3>
          {stats && (
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.promedio.toFixed(1)}
                </span>
                <span className="text-slate-500 dark:text-slate-400 ml-1">/ 5</span>
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                {stats.aprobadas} {stats.aprobadas === 1 ? "reseña" : "reseñas"}
              </div>
            </div>
          )}
        </div>

        {isLogged && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
          >
            {showForm ? "Cancelar" : "Escribir Reseña"}
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Tu nombre
              </label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: Juan"
                disabled={submitting}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Tu email (opcional)
              </label>
              <input
                type="email"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: juan@example.com"
                disabled={submitting}
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Calificación
              </label>
              <StarInput
                value={formData.rating}
                onChange={(rating) => setFormData({ ...formData, rating })}
              />
            </div>

            {/* Comentario */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Tu comentario
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-vertical min-h-24"
                placeholder="Cuéntanos tu experiencia con este producto..."
                disabled={submitting}
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
            >
              {submitting ? "Enviando..." : "Enviar Reseña"}
            </button>

            {submitSuccess && (
              <div className="text-center py-2 px-3 rounded-lg bg-green-50 dark:bg-green-400/10 border border-green-200 dark:border-green-400/30">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  ✓ ¡Gracias por dejar tu reseña!
                </p>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Lista de reseñas */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">No hay reseñas aún. ¡Sé el primero!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600"
            >
              {/* Header de reseña */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white">
                    {review.userName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString("es-EC", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < review.rating
                          ? "text-yellow-400"
                          : "text-slate-300 dark:text-slate-600"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {/* Comentario */}
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje si no está logueado */}
      {!isLogged && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
            ¿Quieres dejar tu reseña? Inicia sesión para continuar.
          </p>
          <a
            href="/admin-login"
            className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
          >
            Iniciar sesión →
          </a>
        </div>
      )}
    </div>
  );
}

// Ejemplo de uso en una página:
/*
import { ReviewsComponent } from "@/components/ReviewsComponent";
import { obtenerResenasPorProducto } from "@/lib/reviews-db";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const reviews = await obtenerResenasPorProducto(params.id);
  
  return (
    <div>
      {/* ... resto del contenido ... */}
      {/* <ReviewsComponent
        productId={params.id}
        productName="Nombre del Producto"
        reviews={reviews}
      /> */}
    {/* </div>
  );
}
*/
