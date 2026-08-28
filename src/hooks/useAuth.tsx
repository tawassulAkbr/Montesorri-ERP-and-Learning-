import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, Role } from '../types';
import { apiPost, setToken, clearToken, getToken } from '@/lib/api';

interface AuthContextType {
  currentUser: User | null;
  role: Role | null;
  token: string | null;
  login: (email: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('kg_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [role, setRole] = useState<Role | null>(() => {
    return (sessionStorage.getItem('kg_role') as Role) || null;
  });
  const [token, setTokenState] = useState<string | null>(() => getToken());

  const login = useCallback(async (email: string, password: string, selectedRole: Role): Promise<boolean> => {
    try {
      const res = await apiPost<{ token: string; user: User }>('/auth/login', {
        email,
        password,
        role: selectedRole,
      });
      setToken(res.token);
      setTokenState(res.token);
      setCurrentUser(res.user);
      setRole(selectedRole);
      sessionStorage.setItem('kg_user', JSON.stringify(res.user));
      sessionStorage.setItem('kg_role', selectedRole);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setCurrentUser(null);
    setRole(null);
    sessionStorage.removeItem('kg_user');
    sessionStorage.removeItem('kg_role');
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, role, token, login, logout, isAuthenticated: !!currentUser && !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
