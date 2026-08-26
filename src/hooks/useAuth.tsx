import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, Role } from '../types';
import { teachers, students, parents, admins, mockCredentials } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  role: Role | null;
  login: (email: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const allUsers: User[] = [...teachers, ...students, ...parents, ...admins];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('kg_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [role, setRole] = useState<Role | null>(() => {
    return (sessionStorage.getItem('kg_role') as Role) || null;
  });

  const login = useCallback(async (email: string, password: string, selectedRole: Role): Promise<boolean> => {
    const creds = mockCredentials[selectedRole];
    if (email.toLowerCase() === creds.email && password === creds.password) {
      const user = allUsers.find(u => u.id === creds.userId) || null;
      if (user) {
        setCurrentUser(user);
        setRole(selectedRole);
        sessionStorage.setItem('kg_user', JSON.stringify(user));
        sessionStorage.setItem('kg_role', selectedRole);
        return true;
      }
    }
    return false;
  }, []);

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
