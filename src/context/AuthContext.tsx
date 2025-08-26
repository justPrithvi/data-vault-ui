'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/axios';

let logoutFn: (() => void) | null = null; // 👈 global reference

interface AuthContextType {
  user: any;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  authContextLoading: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();
  const [authContextLoading, setAuthContextLoading] = useState<boolean>(true);

  // On mount, load from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    if (storedUser && storedToken) {
      setUserState(JSON.parse(storedUser));
      setAccessToken(storedToken);
    }
    setAuthContextLoading(false)
  }, []);

  const setUser = (userData: any, token?: string) => {
    setUserState(userData);
    if (token) setAccessToken(token);

    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) localStorage.setItem('accessToken', token);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      const data = response.data;

      setUser({ email }, data.accessToken); // persist user + token
      router.push('/screens/dashboard');
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };
  const logout = () => {
    setUserState(null);
    setAccessToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    router.push('/auth/login');
  };
  logoutFn = logout; // 👈 keep global reference updated

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, authContextLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export function getLogoutFn() {
  return logoutFn;
}
