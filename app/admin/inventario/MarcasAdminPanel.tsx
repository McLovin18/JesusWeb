"use client";

import { useState, useEffect } from "react";
import { crearMarca, obtenerMarcas, eliminarMarca } from "@/lib/marcas-db";

type Marca = {
  id: string;
  nombre: string;
  logo?: string;
};

export default function MarcasAdminPanel() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [nuevaMarca, setNuevaMarca] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarMarcas();
  }, []);

  const cargarMarcas = async () => {
    setLoading(true);
    try {
      const marcasDb = await obtenerMarcas();
      setMarcas(marcasDb || []);
    } catch (error) {
      console.error('Error cargando marcas:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarMarca = async () => {
    if (!nuevaMarca.trim()) return;
    setLoading(true);
    try {
      const nuevaId = await crearMarca({
        nombre: nuevaMarca,
      });
      console.log('Marca creada con ID:', nuevaId);
      
      // Recargar las marcas desde Firestore
      await cargarMarcas();
      
      setNuevaMarca("");
    } catch (error) {
      console.error('Error creando marca:', error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarMarcaHandler = async (marcaId: string) => {
    setLoading(true);
    try {
      await eliminarMarca(marcaId);
      console.log('Marca eliminada:', marcaId);
      
      // Recargar las marcas desde Firestore
      await cargarMarcas();
    } catch (error) {
      console.error('Error eliminando marca:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
        🏷️ Gestión de Marcas
      </h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          className="flex-1 border rounded-lg px-4 py-2 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          placeholder="Nueva marca..."
          value={nuevaMarca}
          onChange={(e) => setNuevaMarca(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && agregarMarca()}
        />
        <button
          onClick={agregarMarca}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Agregar
        </button>
      </div>

      <div className="space-y-2">
        {marcas.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            No hay marcas. Agrega una nueva.
          </p>
        ) : (
          marcas.map((marca) => (
            <div
              key={marca.id}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
            >
              <span className="font-medium text-slate-900 dark:text-white">
                {marca.nombre}
              </span>
              <button
                onClick={() => eliminarMarcaHandler(marca.id)}
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
