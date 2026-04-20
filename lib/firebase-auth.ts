import {
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from './firebase';

export const loginUser = async (email: string, password: string) => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    return {
      success: true,
      user: result.user,
      idToken,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const updateUserPassword = async (newPassword: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    await updatePassword(user, newPassword);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createAdminUser = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Auth state listener
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
