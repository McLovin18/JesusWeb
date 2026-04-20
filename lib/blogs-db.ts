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
  where,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Blog } from '@/types/blog';

// ═══ CREATE ═══
export const crearBlog = async (blog: Blog) => {
  try {
    const now = Date.now();
    const slug = blog.slug || blog.title.toLowerCase().replace(/\s+/g, '-');
    const docRef = doc(collection(db, 'blogs'));
    
    // Filtrar valores undefined
    const data = Object.fromEntries(
      Object.entries({
        ...blog,
        slug,
        createdAt: blog.createdAt || now,
        updatedAt: now,
        vistas: 0,
        etiquetas: blog.etiquetas || [],
        blocks: blog.blocks || [],
      }).filter(([_, v]) => v !== undefined)
    );
    
    await setDoc(docRef, data);
    return docRef.id;
  } catch (error) {
    console.error('Error creando blog:', error);
    throw error;
  }
};

// ═══ READ ═══
export const obtenerBlogs = async (): Promise<Blog[]> => {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'blogs'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Blog[];
  } catch (error) {
    console.error('Error obteniendo blogs:', error);
    return [];
  }
};

export const obtenerBlogsAdmin = async (): Promise<Blog[]> => {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'blogs'), orderBy('createdAt', 'desc'))
    );
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Blog[];
  } catch (error) {
    console.error('Error obteniendo blogs (admin):', error);
    return [];
  }
};

export const obtenerBlogPorId = async (id: string): Promise<Blog | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'blogs', id));
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Blog;
  } catch (error) {
    console.error('Error obteniendo blog:', error);
    return null;
  }
};

export const obtenerBlogPorSlug = async (slug: string): Promise<Blog | null> => {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'blogs'), where('slug', '==', slug))
    );
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Blog;
  } catch (error) {
    console.error('Error obteniendo blog por slug:', error);
    return null;
  }
};

// ═══ UPDATE ═══
export const actualizarBlog = async (id: string, updates: Partial<Blog>) => {
  try {
    // Filtrar valores undefined
    const data = Object.fromEntries(
      Object.entries({
        ...updates,
        updatedAt: Date.now(),
      }).filter(([_, v]) => v !== undefined)
    );
    
    await updateDoc(doc(db, 'blogs', id), data);
  } catch (error) {
    console.error('Error actualizando blog:', error);
    throw error;
  }
};

// ═══ DELETE ═══
export const eliminarBlog = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'blogs', id));
  } catch (error) {
    console.error('Error eliminando blog:', error);
    throw error;
  }
};

// ═══ BÚSQUEDA ═══
export const buscarBlogs = async (query_text: string): Promise<Blog[]> => {
  try {
    const blogs = await obtenerBlogs();
    const text = query_text.toLowerCase();
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(text) ||
        b.contenido?.toLowerCase().includes(text) ||
        b.etiquetas?.some((e) => e.toLowerCase().includes(text))
    );
  } catch (error) {
    console.error('Error buscando blogs:', error);
    return [];
  }
};

export const obtenerBlogsPorEtiqueta = async (etiqueta: string): Promise<Blog[]> => {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'blogs'),
        where('etiquetas', 'array-contains', etiqueta),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Blog[];
  } catch (error) {
    console.error('Error obteniendo blogs por etiqueta:', error);
    return [];
  }
};

// ═══ INCREMENT VIEWS ═══
export const incrementarVistas = async (blogId: string): Promise<void> => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    await updateDoc(blogRef, {
      vistas: increment(1),
    });
  } catch (error) {
    console.error('Error incrementando vistas:', error);
  }
};

// Re-exportar tipos
export type { Blog } from '@/types/blog';
