import { createContext, useState, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
import api from '../services/api';

interface PortalUser {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  createdAt?: string;
}

interface PortalAuthContextType {
  user: PortalUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: { name?: string; phoneNumber?: string }) => Promise<void>;
}

const PortalAuthContext = createContext<PortalAuthContextType | undefined>(undefined);

const getStoredPortalUser = (): PortalUser | null => {
  try {
    const stored = localStorage.getItem('portalUser');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const PortalAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<PortalUser | null>(() => getStoredPortalUser());
  const [loading, setLoading] = useState<boolean>(false);
  const isInitialized = useRef(false);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('portalToken');
    localStorage.removeItem('portalUser');
  }, []);

  const setUserData = useCallback((userData: PortalUser, token: string) => {
    setUser(userData);
    localStorage.setItem('portalToken', token);
    localStorage.setItem('portalUser', JSON.stringify(userData));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post('/portal/login', { email, password });
    const { token, user: userData } = response.data;
    setUserData(userData, token);
  }, [setUserData]);

  const register = useCallback(async (email: string, name: string, password: string) => {
    const response = await api.post('/portal/register', { email, name, password });
    const { token, user: userData } = response.data;
    setUserData(userData, token);
  }, [setUserData]);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem('portalToken');
    if (!token) return;

    try {
      const response = await api.get('/portal/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('portalUser', JSON.stringify(userData));
    } catch {
      logout();
    }
  }, [logout]);

  const updateProfile = useCallback(async (data: { name?: string; phoneNumber?: string }) => {
    const token = localStorage.getItem('portalToken');
    if (!token) return;

    const response = await api.put('/portal/me', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { user: userData } = response.data;
    setUser(userData);
    localStorage.setItem('portalUser', JSON.stringify(userData));
  }, []);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      const token = localStorage.getItem('portalToken');
      if (token) {
        setLoading(true);
        refreshProfile().finally(() => setLoading(false));
      }
    }
  }, [refreshProfile]);

  const isAuthenticated = !!user;

  return (
    <PortalAuthContext.Provider
      value={{ user, isAuthenticated, loading, login, register, logout, refreshProfile, updateProfile }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
};

export const usePortalAuth = () => {
  const context = useContext(PortalAuthContext);
  if (context === undefined) {
    throw new Error('usePortalAuth must be used within a PortalAuthProvider');
  }
  return context;
};
