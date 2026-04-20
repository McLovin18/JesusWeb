import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export type Bodega = {
  id: string;
  nombre: string;
  ubicacion?: string;
  capacidad?: number;
  tiempoEntrega?: number; // 24 o 72 horas
  createdAt?: number;
};

export const obtenerBodegas = async (): Promise<Bodega[]> => {
  try {
    const q = query(collection(db, 'bodegas'), orderBy('nombre', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Bodega[];
  } catch (error) {
    console.error('Error fetching bodegas:', error);
    return [];
  }
};

export const crearBodega = async (bodega: Omit<Bodega, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'bodegas'), {
      ...bodega,
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating bodega:', error);
    throw error;
  }
};

export const crearBodegaDefault = async () => {
  try {
    const bodegas = await obtenerBodegas();
    if (bodegas.length === 0) {
      await crearBodega({
        nombre: 'Bodega Principal',
        ubicacion: 'Principal',
        capacidad: 1000
      });
    }
  } catch (error) {
    console.error('Error creating default bodega:', error);
  }
};

export const eliminarBodega = async (bodegaId: string) => {
  try {
    await deleteDoc(doc(db, 'bodegas', bodegaId));
  } catch (error) {
    console.error('Error deleting bodega:', error);
    throw error;
  }
};
