import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Producto {
  id?: string;
  nombre: string;
  sku?: string;
  stock: number;
  precio: number;
  descuento?: number;
  categoria: string;
  subcategoria?: string;
  subsubcategoria?: string;
  marca?: string;
  imagenes: string[];
  descripcion: string;
  caracteristicas?: string[];
  bodegaId?: string;
  destacado?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

// ═══ CREATE ═══
export const crearProducto = async (producto: Producto) => {
  try {
    const now = Date.now();
    const docRef = doc(collection(db, 'productos'));
    await setDoc(docRef, {
      ...producto,
      imagenes: producto.imagenes || [],
      caracteristicas: producto.caracteristicas || [],
      createdAt: producto.createdAt || now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creando producto:', error);
    throw error;
  }
};

// ═══ READ ═══
export const obtenerProductos = async (): Promise<Producto[]> => {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'productos'), orderBy('createdAt', 'desc'))
    );
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Producto[];
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return [];
  }
};

export const obtenerProductoPorId = async (id: string): Promise<Producto | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'productos', id));
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Producto;
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return null;
  }
};

export const obtenerProductosPorCategoria = async (categoriaId: string): Promise<Producto[]> => {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'productos'),
        where('categoria', '==', categoriaId),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Producto[];
  } catch (error) {
    console.error('Error obteniendo productos por categoría:', error);
    return [];
  }
};

export const buscarProductos = async (query_text: string): Promise<Producto[]> => {
  try {
    const productos = await obtenerProductos();
    const text = query_text.toLowerCase();
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(text) ||
        p.descripcion?.toLowerCase().includes(text) ||
        p.marca?.toLowerCase().includes(text) ||
        p.sku?.toLowerCase().includes(text)
    );
  } catch (error) {
    console.error('Error buscando productos:', error);
    return [];
  }
};

// ═══ UPDATE ═══
export const actualizarProducto = async (id: string, updates: Partial<Producto>) => {
  try {
    await updateDoc(doc(db, 'productos', id), {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    throw error;
  }
};

// ═══ DELETE ═══
export const eliminarProducto = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'productos', id));
  } catch (error) {
    console.error('Error eliminando producto:', error);
    throw error;
  }
};

// ═══ UTILIDADES ═══
export const obtenerProductosConStock = async (): Promise<Producto[]> => {
  const productos = await obtenerProductos();
  return productos.filter((p) => p.stock > 0);
};

export const obtenerProductosSinStock = async (): Promise<Producto[]> => {
  const productos = await obtenerProductos();
  return productos.filter((p) => p.stock === 0);
};
