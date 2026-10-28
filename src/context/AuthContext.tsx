import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  apiGetMe,
  apiLogin,
  apiSignup,
  apiGoogleLogin,
  removeAuthToken,
} from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string, name?: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'forgot';
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');

  const refreshProfile = async () => {
    try {
      const profile = await apiGetMe();
      setUser(profile);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await apiLogin({ email, password });
    if (res.user) {
      setUser(res.user);
      setAuthModalOpen(false);
    }
  };

  const signup = async (email: string, password?: string, name?: string) => {
    const res = await apiSignup({ email, password, name });
    if (res.user) {
      setUser(res.user);
      setAuthModalOpen(false);
    }
  };

  const googleLogin = async (credential: string) => {
    const res = await apiGoogleLogin(credential);
    if (res.user) {
      setUser(res.user);
      setAuthModalOpen(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        googleLogin,
        logout,
        refreshProfile,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
