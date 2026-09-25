import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api, { setApiAccessToken } from '../api/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  quickSwitchUser: (email: string, role?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuthSession() {
      try {
        const response = await api.post('/auth/refresh');
        if (response.data && response.data.accessToken) {
          setToken(response.data.accessToken);
          setApiAccessToken(response.data.accessToken);
          setUser(response.data.user);
        }
      } catch (err) {
        setToken(null);
        setApiAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthSession();
  }, []);

  const login = (userData: User, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
    setApiAccessToken(accessToken);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      setApiAccessToken(null);
    }
  };

  const quickSwitchUser = async (email: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password: 'password123',
      });
      login(response.data.user, response.data.accessToken);
    } catch (err) {
      console.error('Quick switch failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, quickSwitchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
