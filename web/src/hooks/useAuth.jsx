import { useState, useEffect, createContext, useContext } from 'react';
import api from '@/lib/api';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        checkAuth();
    }, []);
    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get('/auth/me');
            if (data.success) {
                setUser(data.data.user);
            }
        }
        catch (error) {
            console.error('Auth verification failed:', error);
            localStorage.removeItem('token');
        }
        finally {
            setLoading(false);
        }
    };
    const signIn = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            if (data.success) {
                localStorage.setItem('token', data.data.token);
                setUser(data.data.user);
                return { error: null };
            }
            return { error: new Error(data.message || 'Login failed') };
        }
        catch (error) {
            return { error: new Error(error.response?.data?.message || error.message || 'Login failed') };
        }
    };
    const signUp = async (email, password, fullName, role) => {
        try {
            const { data } = await api.post('/auth/register', { email, password, fullName, role });
            if (data.success) {
                localStorage.setItem('token', data.data.token);
                setUser(data.data.user);
                return { error: null };
            }
            return { error: new Error(data.message || 'Registration failed') };
        }
        catch (error) {
            return { error: new Error(error.response?.data?.message || error.message || 'Registration failed') };
        }
    };
    const signOut = async () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/auth';
    };
    return (<AuthContext.Provider value={{ user, role: user?.role || null, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
