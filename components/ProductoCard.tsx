"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import { useTracking } from "../lib/useAnalytics";
import { useToast } from "../context/ToastContext";

function ProductoCard({
  producto,
  onClick,
  showCart = false,
  showEye = true,
  onAddCart,
  onEye,
  showFav = false,
  compact = false,
}) {
  const {
    isLogged,
    isCliente,
    isAdmin,
    carrito,
    addCarrito,
    removeCarrito,
  } = useUser();
  const router = useRouter();
  const { trackProductClick } = useTracking();
  const { showToast } = useToast();

  // const isFav = favoritos?.some((p) => p.id === producto.id);
  const inCart = carrito?.some((p) => p.id === producto.id);
  const sinStock = producto.stock === 0;

  const basePrice = Number(producto?.precio || 0);
  const discount = Number(producto?.descuento || 0);
  const hasDiscount = !isNaN(discount) && discount > 0 && discount < 100;
  const fakeOldPrice = hasDiscount
    ? Math.ceil(basePrice / (1 - discount / 100))
    : basePrice;
  const finalPrice = hasDiscount ? basePrice * (1 - discount / 100) : basePrice;

  const getDetailUrl = () => {
    let detailUrl = `/product-detail?id=${producto.id}`;
    try {
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/home")) {
        detailUrl = `/home/product-detail?id=${producto.id}`;
      } else {
        if (isAdmin) detailUrl = `/admin/product-detail?id=${producto.id}`;
        if (isCliente) detailUrl = `/home/product-detail?id=${producto.id}`;
      }
    } catch {
      if (isAdmin) detailUrl = `/admin/product-detail?id=${producto.id}`;
      if (isCliente) detailUrl = `/home/product-detail?id=${producto.id}`;
    }
    return detailUrl;
  };

  const goToDetail = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    trackProductClick().catch(console.error);
    router.push(getDetailUrl());
  };



  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sinStock) return;
    if (onAddCart) { 
      onAddCart(producto); 
      showToast("Añadido al carrito", "success");
      return; 
    }
    if (inCart) {
      removeCarrito(producto.id);
      showToast("Eliminado del carrito", "info");
    } else {
      addCarrito({ ...producto, cantidad: 1 });
      showToast(`${producto.nombre} añadido al carrito`, "success");
    }
  };

  const detailUrl = getDetailUrl();

  // Contenido del card (reutilizable)
  const cardContent = (
    <>
      <div
        className={`
          relative flex-shrink-0 overflow-hidden
          bg-white dark:bg-white/[0.03]
          w-[150px] h-[130px] min-h-[150px]
          sm:w-full sm:h-48 sm:min-h-auto
        `}
      >
        <Image
          src={producto.imagenes?.[0] || "/no-image.png"}
          alt={producto.nombre}
          fill
          sizes="(max-width: 640px) 150px, (max-width: 768px) 100vw, 400px"
          className="object-contain p-1 sm:p-5 group-hover:scale-105 transition-transform duration-500"
          priority={false}
          loading="lazy"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow">
            -{discount}%
          </span>
        )}
        {sinStock && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/50 flex items-center justify-center z-10">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-white/60 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10">
              Sin stock
            </span>
          </div>
        )}

      </div>

      <div className="flex flex-col flex-1 min-w-0 p-2 sm:p-4 justify-between sm:h-full">
        <p className="font-semibold leading-tight text-slate-800 dark:text-white text-base sm:text-sm line-clamp-3 sm:line-clamp-3">
          {producto.nombre}
        </p>

        {producto.descripcion && (
          <p className="mt-0.5 text-xs text-slate-400 dark:text-white/35 line-clamp-2 sm:hidden">
            {producto.descripcion}
          </p>
        )}

        <div className="mt-1 sm:mt-3 flex items-baseline gap-2 flex-wrap">
          {hasDiscount && (
            <span className="text-xs sm:text-sm text-[#7b68ee] dark:text-white/30 line-through">
              ${fakeOldPrice.toFixed(2)}
            </span>
          )}
          <span className="text-xl sm:text-lg font-extrabold text-[#7b68ee] dark:text-purple-300">
            ${basePrice.toFixed(2)}
          </span>
        </div>

        {(showCart || showEye) && (
          <div className="mt-2 sm:mt-3 flex gap-2">
            {showCart && (
              <button
                onClick={handleCart}
                disabled={sinStock}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                  ${sinStock
                    ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20 cursor-not-allowed"
                    : inCart
                      ? "bg-purple-100 dark:bg-purple-900/40 text-[#7b68ee] dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-95"
                  }
                `}
              >
                <span className="material-icons-round text-[16px]">
                  {inCart ? "remove_shopping_cart" : "add_shopping_cart"}
                </span>
                <span className="hidden xs:inline sm:hidden lg:inline">
                  {inCart ? "Quitar" : "Añadir"}
                </span>
              </button>
            )}

            {showEye && (
              <button
                onClick={(e) => { 
                  e.preventDefault();
                  e.stopPropagation(); 
                  onEye ? onEye(producto) : goToDetail(e); 
                }}
                className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-all duration-200"
                title="Ver detalle"
              >
                <span className="material-icons-round text-[18px]">visibility</span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );

  const containerClass = `
    group cursor-pointer
    bg-white dark:bg-white/[0.04]
    dark:border-white/10
    rounded-2xl overflow-hidden
    shadow-sm
    hover:shadow-xl dark:hover:shadow-purple-950/60
    hover:border-[#7b68ee] dark:hover:border-[#7b68ee]
    transition-all duration-300
    sm:h-full
    flex flex-row items-stretch
    sm:flex-col
    ${compact ? 'sm:flex-row sm:h-auto' : ''}
  `;

  // Si onClick está definido, no usar Link
  if (onClick) {
    return (
      <div onClick={onClick} className={containerClass}>
        {cardContent}
      </div>
    );
  }

  // Si onClick NO está definido, usar Link para navegar
  return (
    <Link href={detailUrl}>
      <div className={containerClass}>
        {cardContent}
      </div>
    </Link>
  );
}

// Memoizar para evitar re-renders innecesarios cuando aparece en listas
export default React.memo(ProductoCard, (prevProps, nextProps) => {
  return (
    prevProps.producto.id === nextProps.producto.id &&
    prevProps.showCart === nextProps.showCart &&
    prevProps.showEye === nextProps.showEye &&
    prevProps.showFav === nextProps.showFav &&
    prevProps.onClick === nextProps.onClick
  );
});
