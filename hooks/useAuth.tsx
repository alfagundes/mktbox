import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebaseConfig';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FbUser
} from 'firebase/auth';
import {
  doc,
  getDoc
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Role = 'admin' | 'morador';
type User = { uid: string; email: string; role: Role };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const cached = await AsyncStorage.getItem('@role_' + fbUser.uid);
      let role: Role | '';
      if (cached) {
        role = cached as Role;
      } else {
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        role = (snap.data()?.role ?? 'morador') as Role;
        await AsyncStorage.setItem('@role_' + fbUser.uid, role);
      }
      setUser({ uid: fbUser.uid, email: fbUser.email!, role });
      setLoading(false);
    });
    return unsub;
  }, []);

  async function login(email: string, senha: string) {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      return true;
    } catch (err: any) {
      let msg = 'Erro inesperado. Tente novamente.';
      if (err.code === 'auth/invalid-email') msg = 'E-mail inválido.';
      if (err.code === 'auth/user-not-found') msg = 'Usuário não encontrado.';
      if (err.code === 'auth/wrong-password') msg = 'Senha incorreta.';
      if (err.code === 'auth/too-many-requests') msg = 'Muitas tentativas. Tente mais tarde.';
      alert(msg);
      return false;
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}