"use client";

import { useState, useEffect } from "react";
import { crearBodega, obtenerBodegas, eliminarBodega } from "@/lib/bodegas-db";

type Bodega = {
  id: string;
  nombre: string;
  ubicacion?: string;
  tiempoEntrega?: number;
};

export default function BodegasAdminPanel() {
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [nuevaBodega, setNuevaBodega] = useState("");
  const [nuevaUbicacion, setNuevaUbicacion] = useState("");
  const [nuevoTiempoEntrega, setNuevoTiempoEntrega] = useState<24 | 72>(24);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarBodegas();
  }, []);

  const cargarBodegas = async () => {
    setLoading(true);
    try {
      const bodegasDb = await obtenerBodegas();
      setBodegas(bodegasDb || []);
    } catch (error) {
      console.error('Error cargando bodegas:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarBodega = async () => {
    if (!nuevaBodega.trim()) return;
    setLoading(true);
    try {
      const nuevaId = await crearBodega({
        nombre: nuevaBodega,
        ubicacion: nuevaUbicacion,
        tiempoEntrega: nuevoTiempoEntrega,
      });
      console.log('Bodega creada con ID:', nuevaId);
      
      // Recargar las bodegas desde Firestore
      await cargarBodegas();
      
      setNuevaBodega("");
      setNuevaUbicacion("");
      setNuevoTiempoEntrega(24);
    } catch (error) {
      console.error('Error creando bodega:', error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarBodegaHandler = async (bodegaId: string) => {
    setLoading(true);
    try {
      await eliminarBodega(bodegaId);
      console.log('Bodega eliminada:', bodegaId);
      
      // Recargar las bodegas desde Firestore
      await cargarBodegas();
    } catch (error) {
      console.error('Error eliminando bodega:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
        🏭 Gestión de Bodegas
      </h2>

      <div className="space-y-3 mb-6">
        <input
          type="text"
          className="w-full border rounded-lg px-4 py-2 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          placeholder="Nombre de bodega..."
          value={nuevaBodega}
          onChange={(e) => setNuevaBodega(e.target.value)}
        />
        <input
          type="text"
          className="w-full border rounded-lg px-4 py-2 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          placeholder="Ubicación (opcional)..."
          value={nuevaUbicacion}
          onChange={(e) => setNuevaUbicacion(e.target.value)}
        />
        <select
          className="w-full border rounded-lg px-4 py-2 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          value={nuevoTiempoEntrega}
          onChange={(e) => setNuevoTiempoEntrega(parseInt(e.target.value) as 24 | 72)}
        >
          <option value={24}>Entrega en 24 horas</option>
          <option value={72}>Entrega en 72 horas</option>
        </select>
        <button
          onClick={agregarBodega}
          disabled={loading}
          className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Agregar Bodega
        </button>
      </div>

      <div className="space-y-2">
        {bodegas.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            No hay bodegas. Agrega una nueva.
          </p>
        ) : (
          bodegas.map((bodega) => (
            <div
              key={bodega.id}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {bodega.nombre}
                </p>
                <div className="flex gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {bodega.ubicacion && (
                    <span>Ubicacion: {bodega.ubicacion}</span>
                  )}
                  {bodega.tiempoEntrega && (
                    <span>| Entrega: {bodega.tiempoEntrega}h</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => eliminarBodegaHandler(bodega.id)}
                className="px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
