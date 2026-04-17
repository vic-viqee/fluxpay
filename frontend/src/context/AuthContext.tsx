import { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { IUser } from '../types/User';
import api from '../services/api';

interface AuthContextType {
  user: IUser | null;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
  loading: boolean;
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

  const refreshAuth = useCallback(async () => {
    try {
      const response = await api.get('/users/me');
      const userData = response.data;
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async () => {
    setLoading(true);
    await refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, isAuthenticated, refreshAuth, loading }}>
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