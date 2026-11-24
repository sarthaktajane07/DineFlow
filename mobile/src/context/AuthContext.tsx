import React, { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../lib/api';
import { User } from '../types';
import { AuthContext } from '../hooks/useAuth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await api.get('/auth/me');
      if (data.success && data.data?.user) {
        setUser(data.data.user);
      }
    } catch (e) {
      await SecureStore.deleteItemAsync('token');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success && data.data?.token) {
        await SecureStore.setItemAsync('token', data.data.token);
        setUser(data.data.user);
        return { error: null };
      }
      return { error: new Error(data.message || 'Login failed') };
    } catch (err: any) {
      return { error: new Error(err.response?.data?.message || err.message || 'Login failed') };
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      setUser(null);
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
