import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Categoria {
  id?: string;
  nombre: string;
  icono?: string;
  orden: number;
  descripcion?: string;
  subcategorias?: Categoria[];
  createdAt?: number;
  updatedAt?: number;
}

// ═══ CREATE ═══
export const crearCategoria = async (categoria: Categoria) => {
  try {
    const now = Date.now();
    const docRef = doc(collection(db, 'categorias'));
    
    // Filtrar valores undefined
    const data = Object.fromEntries(
      Object.entries({
        ...categoria,
        createdAt: categoria.createdAt || now,
        updatedAt: now,
        subcategorias: categoria.subcategorias || [],
      }).filter(([_, v]) => v !== undefined)
    );
    
    await setDoc(docRef, data);
    return docRef.id;
  } catch (error) {
    console.error('Error creando categoría:', error);
    throw error;
  }
};

// ═══ READ ═══
export const obtenerCategorias = async (): Promise<Categoria[]> => {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'categorias'), orderBy('orden', 'asc'))
    );
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Categoria[];
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return [];
  }
};

export const obtenerCategoriaPorId = async (id: string): Promise<Categoria | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'categorias', id));
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Categoria;
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    return null;
  }
};

// ═══ UPDATE ═══
export const actualizarCategoria = async (id: string, updates: Partial<Categoria>) => {
  try {
    // Filtrar valores undefined
    const data = Object.fromEntries(
      Object.entries({
        ...updates,
        updatedAt: Date.now(),
      }).filter(([_, v]) => v !== undefined)
    );
    
    await updateDoc(doc(db, 'categorias', id), data);
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    throw error;
  }
};

// ═══ DELETE ═══
export const eliminarCategoria = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'categorias', id));
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    throw error;
  }
};

// ═══ SUBCATEGORÍAS ═══
export const agregarSubcategoria = async (categoriaId: string, subcategoria: Categoria) => {
  try {
    const categoria = await obtenerCategoriaPorId(categoriaId);
    if (!categoria) throw new Error('Categoría no encontrada');

    const subcategorias = categoria.subcategorias || [];
    const nuevaSub = {
      id: Math.random().toString(36).slice(2),
      ...subcategoria,
    };
    subcategorias.push(nuevaSub);

    await actualizarCategoria(categoriaId, { subcategorias });
    return nuevaSub.id;
  } catch (error) {
    console.error('Error agregando subcategoría:', error);
    throw error;
  }
};

export const eliminarSubcategoria = async (categoriaId: string, subcategoriaId: string) => {
  try {
    const categoria = await obtenerCategoriaPorId(categoriaId);
    if (!categoria) throw new Error('Categoría no encontrada');

    const subcategorias = (categoria.subcategorias || []).filter((s) => s.id !== subcategoriaId);
    await actualizarCategoria(categoriaId, { subcategorias });
  } catch (error) {
    console.error('Error eliminando subcategoría:', error);
    throw error;
  }
};
