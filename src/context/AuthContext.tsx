import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { login as apiLogin, fetchMe } from '../api/resources';
import type { AdminUser } from '../types';

interface AuthContextValue {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('dp_admin_token');
    const cached = localStorage.getItem('dp_admin_user');

    if (token && cached) {
      setAdmin(JSON.parse(cached));
      // фонова перевірка валідності токена
      fetchMe()
        .then((data) => setAdmin(data))
        .catch(() => {
          localStorage.removeItem('dp_admin_token');
          localStorage.removeItem('dp_admin_user');
          setAdmin(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const { token, admin: adminData } = await apiLogin(email, password);
    localStorage.setItem('dp_admin_token', token);
    localStorage.setItem('dp_admin_user', JSON.stringify(adminData));
    setAdmin(adminData);
  }

  function logout() {
    localStorage.removeItem('dp_admin_token');
    localStorage.removeItem('dp_admin_user');
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth має використовуватись всередині AuthProvider');
  return ctx;
}
