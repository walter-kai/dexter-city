import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { User } from '../types/User';
import { useMetaMaskAuth } from '../hooks/useMetaMaskAuth';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  connectWallet: () => Promise<User | null>;
  isLoading: boolean;
  isConnecting: boolean;
  currentRoute: string;
  showLoginModal: boolean;
  triggerLoginModal: () => void;
  closeLoginModal: () => void;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const currentRoute = location.pathname;
  
  // MetaMask authentication hook
  const { isConnecting, connectWallet: connectMetaMask, disconnectWallet, error: authError } = useMetaMaskAuth();

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase, but we need the full user data
        // The user data should already be set by the MetaMask connect flow
        console.log('Firebase user authenticated:', firebaseUser.uid);
      } else {
        // User is signed out
        setUser(null);
        sessionStorage.removeItem('currentUser');
      }
      setIsLoading(false);
    });

    // Check for stored user on app initialization
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        sessionStorage.removeItem('currentUser');
      }
    }

    return () => unsubscribe();
  }, []);

  const connectWallet = async (): Promise<User | null> => {
    const userData = await connectMetaMask();
    if (userData) {
      setUser(userData);
      sessionStorage.setItem('currentUser', JSON.stringify(userData));
      setShowLoginModal(false);
    }
    return userData;
  };

  const logout = async () => {
    await disconnectWallet();
    setUser(null);
    sessionStorage.removeItem('currentUser');
  };

  const triggerLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  const value = {
    user,
    setUser: (newUser: User | null) => {
      setUser(newUser);
      if (newUser) {
        sessionStorage.setItem('currentUser', JSON.stringify(newUser));
      } else {
        sessionStorage.removeItem('currentUser');
      }
    },
    logout,
    connectWallet,
    isLoading,
    isConnecting,
    currentRoute,
    showLoginModal,
    triggerLoginModal,
    closeLoginModal,
    authError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
