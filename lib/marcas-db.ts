import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export type Marca = {
  id: string;
  nombre: string;
  logo?: string;
  createdAt?: number;
};

export const obtenerMarcas = async (): Promise<Marca[]> => {
  try {
    const q = query(collection(db, 'marcas'), orderBy('nombre', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Marca[];
  } catch (error) {
    console.error('Error fetching marcas:', error);
    return [];
  }
};

export const crearMarca = async (marca: Omit<Marca, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'marcas'), {
      ...marca,
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating marca:', error);
    throw error;
  }
};

export const eliminarMarca = async (marcaId: string) => {
  try {
    await deleteDoc(doc(db, 'marcas', marcaId));
  } catch (error) {
    console.error('Error deleting marca:', error);
    throw error;
  }
};
