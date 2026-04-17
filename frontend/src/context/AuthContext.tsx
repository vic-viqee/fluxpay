import { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { IUser } from '../types/User';
import api from '../services/api';

interface AuthContextType {
  user: IUser | null;
  isAdmin: boolean;
  logout: () => void;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
  loading: boolean;
  setUserData: (userData: IUser, token?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }, []);

  const setUserData = useCallback((userData: IUser, token?: string) => {
    setUser(userData);
    setIsAdmin(userData.role === 'admin');
    if (token) {
      localStorage.setItem('token', token);
    }
    setLoading(false);
  }, []);

  const refreshAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/users/me');
      const userData = response.data;
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
    } catch (err: any) {
      console.error('Failed to fetch user data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAdmin, logout, isAuthenticated, refreshAuth, loading, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};