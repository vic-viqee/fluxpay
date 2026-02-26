import { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { IUser } from '../types/User'; // Import IUser
import api from '../services/api'; // Import API service

interface AuthContextType {
  token: string | null;
  user: IUser | null; // Add user to context type
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<IUser | null>(null); // State for user data

  const fetchUser = useCallback(async () => {
    if (token) {
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        // Optionally logout if token is invalid
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    // User data will be fetched by the useEffect hook after token changes
  };

  const logout = () => {
    setToken(null);
    setUser(null); // Clear user data on logout
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
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