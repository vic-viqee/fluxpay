import { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { IUser } from '../types/User'; // Import IUser
import api, {
  clearStoredAuth,
  getStoredAccessToken,
  storeAuthTokens,
} from '../services/api'; // Import API service

interface AuthContextType {
  token: string | null;
  user: IUser | null;
  isAdmin: boolean;
  login: (token: string, refreshToken?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(getStoredAccessToken());
  const [user, setUser] = useState<IUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAdmin(false);
    clearStoredAuth();
  }, []);

  const fetchUser = useCallback(async () => {
    if (token) {
      try {
        const response = await api.get('/users/me');
        const userData = response.data;
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        logout();
      }
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (newToken: string, refreshToken?: string) => {
    setToken(newToken);
    storeAuthTokens(newToken, refreshToken);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isAdmin, login, logout, isAuthenticated }}>
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
