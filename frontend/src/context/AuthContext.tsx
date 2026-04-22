import { createContext, useState, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
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
  justLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredUser = (): IUser | null => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(() => getStoredUser());
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const storedUser = getStoredUser();
    return storedUser?.role === 'admin';
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [justLoggedIn, setJustLoggedIn] = useState<boolean>(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setJustLoggedIn(false);
  }, []);

  const setUserData = useCallback((userData: IUser, token?: string) => {
    setUser(userData);
    setIsAdmin(userData.role === 'admin');
    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    setJustLoggedIn(true);
    setLoading(false);
    
    setTimeout(() => {
      setJustLoggedIn(false);
    }, 3000);
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
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      console.error('Failed to fetch user data:', err);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAdmin, logout, isAuthenticated, refreshAuth, loading, setUserData, justLoggedIn }}>
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
