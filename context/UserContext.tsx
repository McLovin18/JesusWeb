'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges } from '@/lib/firebase-auth';

interface UserContextType {
  user: User | null;
  isLogged: boolean;
  isClient: boolean;
  isAdmin: boolean;
  loading: boolean;
  
  // Favorites
  favoritos: any[];
  addFavorito: (producto: any) => void;
  removeFavorito: (productoId: string) => void;
  
  // Cart
  carrito: any[];
  addCarrito: (producto: any) => void;
  removeCarrito: (productoId: string) => void;
  updateCarritoQty: (productoId: string, cantidad: number) => void;
  clearCarrito: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [carrito, setCarrito] = useState<any[]>([]);

  // Auth subscription
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (currentUser) => {
      if (currentUser) {
        try {
          // Forzar refresh del token para obtener los custom claims actualizados
          await currentUser.getIdToken(true);
        } catch (error) {
          console.error('Error refrescando token:', error);
        }
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load favoritos from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('favoritos');
    if (stored) setFavoritos(JSON.parse(stored));
  }, []);

  // Verificar custom claims de admin
  useEffect(() => {
    async function checkAdminClaims() {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setIsAdmin(idTokenResult.claims.admin === true);
        } catch (error) {
          console.error('Error verificando claims:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    }
    checkAdminClaims();
  }, [user]);

  // Load carrito from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('carrito');
    if (stored) setCarrito(JSON.parse(stored));
  }, []);

  // Save favoritos to localStorage
  useEffect(() => {
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  // Save carrito to localStorage
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const addFavorito = (producto: any) => {
    setFavoritos((prev) => {
      const exists = prev.find((p) => p.id === producto.id);
      if (exists) return prev;
      return [...prev, producto];
    });
  };

  const removeFavorito = (productoId: string) => {
    setFavoritos((prev) => prev.filter((p) => p.id !== productoId));
  };

  const addCarrito = (producto: any) => {
    setCarrito((prev) => {
      const exists = prev.find((p) => p.id === producto.id);
      if (exists) {
        return prev.map((p) =>
          p.id === producto.id
            ? { ...p, cantidad: (p.cantidad || 1) + (producto.cantidad || 1) }
            : p
        );
      }
      return [...prev, { ...producto, cantidad: producto.cantidad || 1 }];
    });
  };

  const removeCarrito = (productoId: string) => {
    setCarrito((prev) => prev.filter((p) => p.id !== productoId));
  };

  const updateCarritoQty = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeCarrito(productoId);
      return;
    }
    setCarrito((prev) =>
      prev.map((p) =>
        p.id === productoId ? { ...p, cantidad } : p
      )
    );
  };

  const clearCarrito = () => {
    setCarrito([]);
  };

  const isLogged = !!user;
  const isClient = isLogged && !isAdmin;

  const value: UserContextType = {
    user,
    isLogged,
    isClient,
    isAdmin,
    loading,
    favoritos,
    addFavorito,
    removeFavorito,
    carrito,
    addCarrito,
    removeCarrito,
    updateCarritoQty,
    clearCarrito,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de UserProvider');
  }
  return context;
}
