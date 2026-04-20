'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { obtenerProductos, obtenerProductosPorCategoria } from '@/lib/productos-db';
import { obtenerCategorias } from '@/lib/categorias-db';
import { obtenerBodegas } from '@/lib/bodegas-db';
import { Producto } from '@/lib/productos-db';
import { Categoria } from '@/lib/categorias-db';
import ProductoCard from '../ProductoCard';
import ProductDetail from './ProductDetail';
import styles from './Window.module.css';

type TiendaView = 'productos' | 'categoria' | 'carrito';

export function TiendaWindowContent() {
  const { carrito, removeCarrito, updateCarritoQty } = useUser();
  const { showToast } = useToast();
  
  const [view, setView] = useState<TiendaView>('productos');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Cargar categorías
  useEffect(() => {
    const loadCategorias = async () => {
      const cats = await obtenerCategorias();
      setCategorias(cats);
    };
    loadCategorias();
  }, []);

  // Cargar productos según la vista
  useEffect(() => {
    const loadProductos = async () => {
      setLoading(true);
      try {
        if (selectedCategoria) {
          const prods = await obtenerProductosPorCategoria(selectedCategoria);
          setProductos(prods);
        } else {
          const prods = await obtenerProductos();
          setProductos(prods);
        }
      } catch (error) {
        console.error('Error cargando productos:', error);
        showToast('Error cargando productos', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (view === 'productos' || view === 'categoria') {
      loadProductos();
    }
  }, [view, selectedCategoria, showToast]);

  const totalCarrito = carrito.reduce((sum, p) => sum + (p.cantidad || 1) * Number(p.precio || 0), 0);
  const cantidadItems = carrito.reduce((sum, p) => sum + (p.cantidad || 1), 0);

  // Generar mensaje de WhatsApp
  const handleWhatsAppOrder = async () => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "+593989559127";
    
    // Obtener bodegas para mapear tiempoEntrega
    const bodegas = await obtenerBodegas();
    const bodegasMap = new Map(bodegas.map(b => [b.id, b.tiempoEntrega || 72]));
    
    const productosText = carrito
      .map((p) => {
        const precio = Number(p.precio || 0);
        const tiempoEntrega = bodegasMap.get(p.bodegaId || "technothings") || 72;
        return `${p.nombre} (x${p.cantidad || 1}  $${precio.toFixed(2)}) - Entrega: ${tiempoEntrega}h`;
      })
      .join("\n");
    
    const headerMsg = "Hola! Me gustaría realizar esta compra:\n\n";
    const footerMsg = "\n\n━━━━━━━━━━━━━━━\nTOTAL: $" + totalCarrito.toFixed(2) + "\n━━━━━━━━━━━━━━━\n\nQuiero confirmar disponibilidad!";
    
    const message = encodeURIComponent(headerMsg + productosText + footerMsg);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  // Si hay un producto seleccionado, mostrar ProductDetail
  if (selectedProductId) {
    return (
      <div className={styles.subBody}>
        <ProductDetail 
          productId={selectedProductId} 
          onClose={() => setSelectedProductId(null)} 
        />
      </div>
    );
  }

  return (
    <div className={styles.subBody}>
      {/* ═══ FILA 1: Botón Productos + Categorías + Carrito (TODO EN UNA SOLA FILA) ═══ */}
      <div style={{
        marginBottom: '24px',
        paddingBottom: '24px',
        paddingTop: '18px',
        borderBottom: '1px solid #cbd5e1',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        overflowY: 'hidden',
        flexWrap: 'nowrap',
        minHeight: '44px'
      }}>
        {/* Botón: Todos los productos */}
        <button
          onClick={() => {
            setView('productos');
            setSelectedCategoria(null);
          }}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            border: '2px solid',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: view === 'productos' && !selectedCategoria ? 'rgba(123, 104, 238, 0.2)' : 'transparent',
            borderColor: view === 'productos' && !selectedCategoria ? '#7b68ee' : '#cbd5e1',
            color: view === 'productos' && !selectedCategoria ? '#7b68ee' : '#334155'
          }}
        >
          <span className="material-icons-round" style={{ fontSize: '16px', lineHeight: 1 }}>shopping_bag</span>
          <span>Productos</span>
        </button>

        {/* Categorías - todas en la misma fila */}
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setView('categoria');
              setSelectedCategoria(cat.id ?? null);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              border: '2px solid',
              flexShrink: 0,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: selectedCategoria === cat.id ? 'rgba(123, 104, 238, 0.2)' : 'transparent',
              borderColor: selectedCategoria === cat.id ? '#7b68ee' : '#cbd5e1',
              color: selectedCategoria === cat.id ? '#7b68ee' : '#334155'
            }}
          >
            {cat.icono && <span className="material-icons-round" style={{ fontSize: '16px', lineHeight: 1 }}>{cat.icono}</span>}
            <span>{cat.nombre}</span>
          </button>
        ))}

        {/* Espaciador flexible - empuja el carrito a la derecha */}
        <div style={{ flex: 1, minWidth: 0 }} />

        {/* Botón: Carrito - siempre a la derecha */}
        <button
          onClick={() => setView('carrito')}
          style={{
            padding: '8px 12px',
            paddingRight: '28px',
            marginRight: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            border: '2px solid',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'visible',
            backgroundColor: view === 'carrito' ? 'rgba(123, 104, 238, 0.2)' : 'transparent',
            borderColor: view === 'carrito' ? '#7b68ee' : '#cbd5e1',
            color: view === 'carrito' ? '#7b68ee' : '#334155'
          }}
        >
          <span className="material-icons-round" style={{ fontSize: '16px', lineHeight: 1 }}>shopping_cart</span>
          <span>Carrito</span>
          {cantidadItems > 0 && (
            <span style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '11px',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20
            }}>
              {cantidadItems}
            </span>
          )}
        </button>
      </div>

      {/* ═══ VISTA: Productos ═══ */}
      {(view === 'productos' || view === 'categoria') && (
        <div>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-white/50">Cargando productos...</p>
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons-round text-slate-300 dark:text-white/20 block mb-3" style={{ fontSize: '64px', lineHeight: 1 }}>
                shopping_bag
              </span>
              <p className="text-slate-500 dark:text-white/50">No hay productos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productos.map((producto) => (
                <ProductoCard
                  key={producto.id}
                  producto={producto}
                  onClick={() => setSelectedProductId(producto.id ?? null)}
                  onEye={() => setSelectedProductId(producto.id ?? null)}
                  showCart={true}
                  showEye={true}
                  showFav={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ VISTA: Carrito ═══ */}
      {view === 'carrito' && (
        <div>
          {carrito.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons-round text-slate-300 dark:text-white/20 mb-4" style={{ fontSize: '64px', lineHeight: 1 }}>
                shopping_bag
              </span>
              <p className="text-slate-500 dark:text-white/50 mt-2">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {carrito.map((item) => {
                const basePrice = Number(item.precio || 0);
                const discount = Number(item.descuento || 0);
                const hasDiscount = !isNaN(discount) && discount > 0 && discount < 100;
                const finalPrice = basePrice;
                const lineTotal = finalPrice * (item.cantidad || 1);

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-[#7b68ee] transition-colors"
                  >
                    {item.imagenes?.[0] && (
                      <img
                        src={item.imagenes[0]}
                        alt={item.nombre}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-white line-clamp-2">
                        {item.nombre}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-white/50 mt-1">
                        ${finalPrice.toFixed(2)} x {item.cantidad || 1} = ${lineTotal.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateCarritoQty(item.id, (item.cantidad || 1) - 1)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                      >
                        <span className="material-icons-round" style={{ fontSize: '16px', lineHeight: 1 }}>remove</span>
                      </button>
                      <span className="w-8 text-center font-semibold text-sm">{item.cantidad || 1}</span>
                      <button
                        onClick={() => updateCarritoQty(item.id, (item.cantidad || 1) + 1)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                      >
                        <span className="material-icons-round" style={{ fontSize: '16px', lineHeight: 1 }}>add</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        removeCarrito(item.id);
                        showToast(`${item.nombre} eliminado del carrito`, 'info');
                      }}
                      className="p-1 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
                    >
                      <span className="material-icons-round" style={{ fontSize: '16px', lineHeight: 1 }}>delete</span>
                    </button>
                  </div>
                );
              })}

              {/* Total */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-[#7b68ee]">
                    ${totalCarrito.toFixed(2)}
                  </span>
                </div>

                <button 
                  onClick={async () => await handleWhatsAppOrder()}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round" style={{ fontSize: '18px', lineHeight: 1 }}>send</span>
                  Enviar por WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
