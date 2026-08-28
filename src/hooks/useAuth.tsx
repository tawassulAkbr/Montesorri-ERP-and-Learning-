import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, Role } from '../types';
import { useData } from '@/context/DataContext';

interface AuthContextType {
  currentUser: User | null;
  role: Role | null;
  login: (email: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { credentials, findUser } = useData();
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('kg_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [role, setRole] = useState<Role | null>(() => {
    return (sessionStorage.getItem('kg_role') as Role) || null;
  });

  const login = useCallback(async (email: string, password: string, selectedRole: Role): Promise<boolean> => {
    const match = credentials.find(
      c => c.email.toLowerCase() === email.trim().toLowerCase()
        && c.password === password
        && c.role === selectedRole
    );
    if (!match) return false;
    const user = findUser(match.userId, selectedRole);
    if (!user) return false;
    setCurrentUser(user);
    setRole(selectedRole);
    sessionStorage.setItem('kg_user', JSON.stringify(user));
    sessionStorage.setItem('kg_role', selectedRole);
    return true;
  }, [credentials, findUser]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setRole(null);
    sessionStorage.removeItem('kg_user');
    sessionStorage.removeItem('kg_role');
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, role, login, logout, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
