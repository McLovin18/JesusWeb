import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { ProductReview } from './reviews-types';

// ═══ CREATE ═══
export const crearResena = async (resena: Omit<ProductReview, 'id'>) => {
  try {
    const docRef = doc(collection(db, 'resenas'));
    const ahora = Date.now();
    await setDoc(docRef, {
      ...resena,
      createdAt: ahora,
      status: 'pending',
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creando reseña:', error);
    throw error;
  }
};

// ═══ READ ═══
export const obtenerResenasPendientes = async (): Promise<ProductReview[]> => {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'resenas'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ProductReview[];
  } catch (error) {
    console.error('Error obteniendo reseñas pendientes:', error);
    return [];
  }
};

export const obtenerResenasPorProducto = async (productId: string): Promise<ProductReview[]> => {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'resenas'),
        where('productId', '==', productId),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ProductReview[];
  } catch (error) {
    console.error('Error obteniendo reseñas del producto:', error);
    return [];
  }
};

export const obtenerResenasPorProductoTodas = async (productId: string): Promise<ProductReview[]> => {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'resenas'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ProductReview[];
  } catch (error) {
    console.error('Error obteniendo reseñas del producto:', error);
    return [];
  }
};

export const obtenerResenaPorId = async (id: string): Promise<ProductReview | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'resenas', id));
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as ProductReview;
  } catch (error) {
    console.error('Error obteniendo reseña:', error);
    return null;
  }
};

// ═══ UPDATE ═══
export const aprobarResena = async (id: string) => {
  try {
    await updateDoc(doc(db, 'resenas', id), {
      status: 'approved',
    });
  } catch (error) {
    console.error('Error aprobando reseña:', error);
    throw error;
  }
};

export const rechazarResena = async (id: string) => {
  try {
    await updateDoc(doc(db, 'resenas', id), {
      status: 'rejected',
    });
  } catch (error) {
    console.error('Error rechazando reseña:', error);
    throw error;
  }
};

// ═══ DELETE ═══
export const eliminarResena = async (id: string) => {
  try {
    await updateDoc(doc(db, 'resenas', id), {
      status: 'rejected',
    });
  } catch (error) {
    console.error('Error eliminando reseña:', error);
    throw error;
  }
};

export const obtenerEstadisticasProducto = async (productId: string) => {
  try {
    const todas = await obtenerResenasPorProductoTodas(productId);
    const aprobadas = todas.filter(r => r.status === 'approved');
    
    const promedio = aprobadas.length > 0
      ? aprobadas.reduce((sum, r) => sum + r.rating, 0) / aprobadas.length
      : 0;

    return {
      total: todas.length,
      aprobadas: aprobadas.length,
      pendientes: todas.filter(r => r.status === 'pending').length,
      rechazadas: todas.filter(r => r.status === 'rejected').length,
      promedio: Math.round(promedio * 10) / 10,
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { total: 0, aprobadas: 0, pendientes: 0, rechazadas: 0, promedio: 0 };
  }
};
