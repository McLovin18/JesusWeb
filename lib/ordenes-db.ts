import { db } from './firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';

export type Orden = {
  id: string;
  userId: string;
  items: any[];
  total: number;
  estado: 'pendiente' | 'procesando' | 'completada' | 'cancelada';
  createdAt: number;
  updatedAt: number;
};

export const obtenerTodasOrdenes = async (): Promise<Orden[]> => {
  try {
    const q = query(collection(db, 'ordenes'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Orden[];
  } catch (error) {
    console.error('Error fetching ordenes:', error);
    return [];
  }
};

export const actualizarOrden = async (ordenId: string, data: Partial<Orden>) => {
  try {
    await updateDoc(doc(db, 'ordenes', ordenId), {
      ...data,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating orden:', error);
    throw error;
  }
};

export const deducirStockOrden = async (ordenId: string, productos: any[]) => {
  try {
    // TODO: Implementar lógica de deducción de stock
    console.log('Deducir stock para orden:', ordenId, productos);
  } catch (error) {
    console.error('Error deduciendo stock:', error);
    throw error;
  }
};

export const devolverStockOrden = async (ordenId: string, productos: any[]) => {
  try {
    // TODO: Implementar lógica de devolución de stock
    console.log('Devolver stock para orden:', ordenId, productos);
  } catch (error) {
    console.error('Error devolviendo stock:', error);
    throw error;
  }
};
