'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { obtenerProductoPorId, obtenerProductosPorCategoria, Producto } from '@/lib/productos-db';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { ProductReview } from '@/lib/reviews-types';
import ProductoCard from '@/components/ProductoCard';

interface ProductDetailProps {
  productId: string;
  onClose?: () => void;
}

export default function ProductDetail({ productId, onClose }: ProductDetailProps) {
  // Estados del producto
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de imagen
  const [imgIdx, setImgIdx] = useState(0);
  
  // Estados de reseñas
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  
  // Otros estados
  const [cantidad, setCantidad] = useState(1);
  const [activeTab, setActiveTab] = useState<'caracteristicas' | 'resenas' | null>('caracteristicas');
  const [relacionados, setRelacionados] = useState<Producto[]>([]);

  const { isLogged, user, favoritos, addFavorito, removeFavorito, carrito, addCarrito, removeCarrito } = useUser();
  const { showToast } = useToast();

  // Fetch producto y escucha en tiempo real de reseñas
  useEffect(() => {
    let unsubscribeReviews: Unsubscribe | null = null;
    async function fetchProductoYEscuchar() {
      try {
        setLoading(true);
        const prod = await obtenerProductoPorId(productId);
        setProducto(prod);
        if (prod) {
          // Escuchar reseñas aprobadas en tiempo real
          const q = query(
            collection(db, 'resenas'),
            where('productId', '==', prod.id),
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc')
          );
          unsubscribeReviews = onSnapshot(q, (snapshot) => {
            setReviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ProductReview[]);
          });
          await fetchRelacionados(prod);
        }
      } catch (error) {
        console.error('Error cargando producto:', error);
        showToast('Error cargando producto', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchProductoYEscuchar();
    return () => {
      if (unsubscribeReviews) unsubscribeReviews();
    };
  }, [productId]);

  // Prefill user info
  useEffect(() => {
    if (isLogged && user) {
      setReviewName(user.displayName || '');
      setReviewEmail(user.email || '');
    }
  }, [isLogged, user]);

  // fetchReviews ya no es necesario para mostrar reseñas, pero se usa tras enviar una nueva para forzar revalidación si es necesario
  async function fetchReviews(productId: string) {
    // Ya no se usa para mostrar reseñas, solo para compatibilidad tras submit
    // Ahora las reseñas se actualizan en tiempo real
  }

  async function fetchRelacionados(prod: Producto) {
    try {
      let rel: Producto[] = [];
      if (prod.categoria) {
        // obtenerProductosPorCategoria solo acepta 1 argumento
        rel = await obtenerProductosPorCategoria(prod.categoria);
        // Filtrar el producto actual
        rel = rel.filter((p) => p.id !== prod.id).slice(0, 6);
      }
      setRelacionados(rel);
    } catch (error) {
      console.error('Error cargando relacionados:', error);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError('');

    if (!reviewRating || !reviewText) {
      setReviewError('Completa la calificación y el comentario');
      setReviewLoading(false);
      return;
    }

    if (!isLogged && (!reviewName || !reviewEmail)) {
      setReviewError('Completa nombre y correo para publicar la reseña');
      setReviewLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: producto?.id,
          productName: producto?.nombre || '',
          userName: reviewName || user?.displayName || 'Usuario',
          userEmail: reviewEmail || user?.email || '',
          rating: reviewRating,
          comment: reviewText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviewText('');
        setReviewRating(0);
        setReviewSuccess(true);
        if (!isLogged) {
          setReviewName('');
          setReviewEmail('');
        }
        // fetchReviews(producto!.id); // Ya no es necesario, onSnapshot actualiza automáticamente
        showToast('¡Gracias por tu reseña! Será revisada por el administrador.', 'success');
        
        // Desaparecer el mensaje después de 5 segundos
        setTimeout(() => {
          setReviewSuccess(false);
        }, 5000);
      } else {
        setReviewError('Error al enviar reseña');
      }
    } catch (error) {
      setReviewError('Error de red');
      console.error(error);
    }
    setReviewLoading(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <p className="mt-4 text-sm text-slate-400">Cargando producto...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <span className="material-icons-round text-3xl text-slate-300">inventory_2</span>
        <p className="text-sm text-slate-400">Producto no encontrado</p>
      </div>
    );
  }

  // Cálculos
  const maxCantidad = producto?.stock || 0;
  const isFav = favoritos?.some((p) => p.id === producto?.id);
  const inCart = carrito?.some((p) => p.id === producto?.id);
  const basePrice = Number(producto?.precio || 0);
  const discount = Number(producto?.descuento || 0);
  const hasDiscount = !isNaN(discount) && discount > 0 && discount < 100;
  const finalPrice = basePrice;
  const fakeOldPrice = hasDiscount ? Math.round(basePrice / (1 - discount / 100)) : null;
  const avgRating = reviews.length > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 0;
  const hasCaracteristicas = Array.isArray(producto?.caracteristicas) && producto.caracteristicas.length > 0;

  const handleAddCart = () => {
    if (!producto?.id) return;
    if (inCart) {
      removeCarrito(producto.id);
      showToast('Eliminado del carrito', 'info');
    } else {
      addCarrito({ ...producto, cantidad });
      showToast(`${producto?.nombre} añadido al carrito`, 'success');
    }
  };

  const handleFav = () => {
    if (!producto?.id) return;
    isFav ? removeFavorito(producto.id) : addFavorito(producto);
  };

  const parseDesc = (text: string) => {
    if (!text) return [];
    const lines = text.split(/\r?\n/);
    const items: { text: string; sub: string[] }[] = [];
    let current: string | null = null;
    let sub: string[] = [];
    lines.forEach((line) => {
      const l = line.trim();
      if (!l) return;
      if (l.startsWith('»')) {
        if (current !== null) {
          items.push({ text: current, sub });
          sub = [];
        }
        current = l.replace(/^»+/, '').trim();
      } else if (l.startsWith('–')) {
        sub.push(l.replace(/^–+/, '').trim());
      } else {
        if (sub.length > 0) sub[sub.length - 1] += ' ' + l;
        else if (current !== null) current += ' ' + l;
      }
    });
    if (current !== null) items.push({ text: current, sub });
    return items;
  };

  const descItems = parseDesc((producto as any).descripcion || '');
  const rawDescripcion = (producto as any).descripcion || '';

  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 transition-colors';

  return (
    <div className="flex flex-col gap-6 max-h-[calc(100vh-120px)] overflow-y-auto p-6 bg-white dark:bg-slate-900">
      {/* Header con nombre y close */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white break-words">{producto.nombre}</h1>
          <p className="text-xs text-slate-400 dark:text-white/40 mt-1">SKU: {producto.sku || producto.id}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          >
            <span className="material-icons-round text-slate-400 dark:text-white/50">close</span>
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Galería */}
        <div className="flex flex-col gap-3 lg:w-1/3">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            {hasDiscount && (
              <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            <img src={producto.imagenes[imgIdx]} alt={producto.nombre} className="w-full h-full object-contain p-4" />

            {/* Botones prev/next */}
            {producto.imagenes.length > 1 && imgIdx > 0 && (
              <button
                onClick={() => setImgIdx(imgIdx - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 dark:bg-slate-800/80 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-colors"
              >
                <span className="material-icons-round text-sm text-slate-700 dark:text-white">chevron_left</span>
              </button>
            )}
            {producto.imagenes.length > 1 && imgIdx < producto.imagenes.length - 1 && (
              <button
                onClick={() => setImgIdx(imgIdx + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 dark:bg-slate-800/80 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-colors"
              >
                <span className="material-icons-round text-sm text-slate-700 dark:text-white">chevron_right</span>
              </button>
            )}
          </div>

          {/* Miniaturas */}
          {producto.imagenes.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {producto.imagenes.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImgIdx(idx)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    imgIdx === idx
                      ? 'border-purple-500 scale-105'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-sm ${i < Math.round(avgRating) ? 'text-yellow-400' : 'text-slate-300 dark:text-white/10'}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-slate-500 dark:text-white/50">
                {avgRating.toFixed(1)} ({reviews.length})
              </span>
            </div>
          )}

          {/* Precios */}
          <div className="flex items-baseline gap-2 flex-wrap">
            {hasDiscount && (
              <span className="text-xs text-slate-400 dark:text-white/40 line-through">
                ${fakeOldPrice?.toFixed(2)}
              </span>
            )}
            <span className="text-2xl font-bold text-slate-900 dark:text-white">${finalPrice.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-400/10 px-2 py-0.5 rounded">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-white/50 font-medium">Disponibilidad:</span>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${
                producto.stock > 0
                  ? 'bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-400/10 text-red-600 dark:text-red-400'
              }`}
            >
              {producto.stock > 0 ? `${producto.stock} en stock` : 'Sin stock'}
            </span>
          </div>

          {/* Cantidad */}
          {producto.stock > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-white/50 font-medium">Cantidad:</span>
              <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-lg p-0.5 gap-1">
                <button
                  onClick={() => setCantidad((v) => Math.max(1, v - 1))}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-600 dark:text-white/60 hover:bg-white dark:hover:bg-white/10 font-bold text-sm transition-colors"
                >
                  −
                </button>
                <span className="w-6 text-center text-xs font-semibold text-slate-800 dark:text-white">{cantidad}</span>
                <button
                  onClick={() => setCantidad((v) => Math.min(maxCantidad, v + 1))}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-600 dark:text-white/60 hover:bg-white dark:hover:bg-white/10 font-bold text-sm transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleAddCart}
              disabled={producto.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                producto.stock === 0
                  ? 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-white/40 cursor-not-allowed'
                  : inCart
                    ? 'bg-purple-100 dark:bg-purple-400/20 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-400/30'
                    : 'bg-purple-600 dark:bg-purple-600 text-white hover:bg-purple-700 dark:hover:bg-purple-700 shadow'
              }`}
            >
              <span className="material-icons-round text-sm">
                {inCart ? 'remove_shopping_cart' : 'add_shopping_cart'}
              </span>
              {inCart ? 'Quitar' : 'Añadir'}
            </button>

            {isLogged && (
              <button
                onClick={handleFav}
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  isFav
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/20'
                }`}
              >
                <span className="material-icons-round text-base" style={{ fontSize: '16px', lineHeight: 1 }}>
                  {isFav ? 'favorite' : 'favorite_border'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Características / Reseñas Tabs */}
      {(hasCaracteristicas || reviews.length > 0) && (
        <div className="border-t border-slate-200 dark:border-white/10 pt-4">
          <div className="flex gap-2 mb-4">
            {hasCaracteristicas && (
              <button
                onClick={() => setActiveTab(activeTab === 'caracteristicas' ? null : 'caracteristicas')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'caracteristicas'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/20'
                }`}
              >
                <span className="material-icons-round text-xs" style={{ fontSize: '14px', lineHeight: 1 }}>
                  list_alt
                </span>
                Características
              </button>
            )}
            <button
              onClick={() => setActiveTab(activeTab === 'resenas' ? null : 'resenas')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'resenas'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/20'
              }`}
            >
              <span className="material-icons-round text-xs" style={{ fontSize: '14px', lineHeight: 1 }}>
                star_outline
              </span>
              Reseñas ({reviews.length})
            </button>
          </div>

          {activeTab === 'caracteristicas' && hasCaracteristicas && (
            <ul className="space-y-2 text-xs">
              {producto?.caracteristicas?.map((c, idx) => (
                <li key={idx} className="flex gap-2 text-slate-700 dark:text-white/80">
                  <span className="text-slate-300 dark:text-white/20 flex-shrink-0">›</span>
                  {c}
                </li>
              ))}
            </ul>
          )}

          {activeTab === 'resenas' && (
            <ReviewsSection
              reviews={reviews}
              avgRating={avgRating}
              reviewRating={reviewRating}
              setReviewRating={setReviewRating}
              reviewName={reviewName}
              setReviewName={setReviewName}
              reviewEmail={reviewEmail}
              setReviewEmail={setReviewEmail}
              reviewText={reviewText}
              setReviewText={setReviewText}
              reviewError={reviewError}
              reviewSuccess={reviewSuccess}
              reviewLoading={reviewLoading}
              handleSubmitReview={handleSubmitReview}
              isLogged={isLogged}
              inputCls={inputCls}
            />
          )}
        </div>
      )}

      {/* Descripción */}
      {rawDescripcion.trim() && (
        <div className="border-t border-slate-200 dark:border-white/10 pt-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Descripción</h3>
          {descItems.length > 0 && (descItems.length > 1 || descItems[0].sub.length > 0 || descItems[0].text !== rawDescripcion.trim()) ? (
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-white/75">
              {descItems.map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-slate-300 dark:text-white/20 flex-shrink-0">›</span>
                  <span>
                    {item.text}
                    {item.sub.length > 0 && (
                      <ul className="mt-1 space-y-0.5 ml-2">
                        {item.sub.map((s, j) => (
                          <li key={j} className="flex gap-1 text-slate-500 dark:text-white/50">
                            <span className="flex-shrink-0">–</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-700 dark:text-white/75 whitespace-pre-line">{rawDescripcion}</p>
          )}
        </div>
      )}

      {/* Productos relacionados */}
      {relacionados.length > 0 && (
        <div className="border-t border-slate-200 dark:border-white/10 pt-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Productos relacionados</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {relacionados.slice(0, 3).map((prod) => (
              <ProductoCard
                key={prod.id}
                producto={prod}
                compact
                onClick={() => {}}
                onAddCart={() => {}}
                onEye={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de reseñas
function ReviewsSection({
  reviews,
  avgRating,
  reviewRating,
  setReviewRating,
  reviewName,
  setReviewName,
  reviewEmail,
  setReviewEmail,
  reviewText,
  setReviewText,
  reviewError,
  reviewSuccess,
  reviewLoading,
  handleSubmitReview,
  isLogged,
  inputCls,
}: any) {
  return (
    <div className="space-y-4 text-xs">
      {/* Resumen */}
      {reviews.length > 0 ? (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{avgRating.toFixed(1)}</span>
          <div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-xs ${i < Math.round(avgRating) ? 'text-yellow-400' : 'text-slate-300 dark:text-white/10'}`}>
                  ★
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-white/50">
              {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-600 dark:text-white/70">Sé el primero en dejar una reseña.</p>
      )}

      {/* Lista de reseñas */}
      {reviews.length > 0 && (
        <ul className="space-y-2 max-h-40 overflow-y-auto">
          {reviews.map((r: any) => (
            <li key={r.id} className="pb-2 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-1 mb-1 flex-wrap">
                <span className="text-xs font-semibold text-slate-700 dark:text-white/80">{r.userName}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-xs ${i < r.rating ? 'text-yellow-400' : 'text-slate-300 dark:text-white/10'}`}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-white/60 line-clamp-2">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmitReview} className="pt-2 space-y-2 border-t border-slate-100 dark:border-white/5">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Nombre"
            value={reviewName}
            onChange={(e) => setReviewName(e.target.value)}
            className={inputCls}
            required={!isLogged}
          />
          <input
            type="email"
            placeholder="Correo"
            value={reviewEmail}
            onChange={(e) => setReviewEmail(e.target.value)}
            className={inputCls}
            required={!isLogged}
          />
        </div>

        <div>
          <label className="text-xs text-slate-600 dark:text-white/70 block mb-1">Calificación</label>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                onClick={() => setReviewRating(i + 1)}
                role="button"
                className={`text-lg cursor-pointer transition-transform hover:scale-110 select-none ${
                  i < reviewRating ? 'text-yellow-400' : 'text-slate-300 dark:text-white/10'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <textarea
          placeholder="Tu comentario..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className={`${inputCls} resize-none`}
          rows={2}
          required
        />

        {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}

        <button
          type="submit"
          disabled={reviewLoading}
          className="w-full px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-all"
        >
          {reviewLoading ? 'Enviando...' : 'Publicar'}
        </button>

        {reviewSuccess && (
          <div className="text-center py-2 px-3 rounded-lg bg-green-50 dark:bg-green-400/10 border border-green-200 dark:border-green-400/30">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400">
              ✓ ¡Gracias por dejar tu reseña!
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
