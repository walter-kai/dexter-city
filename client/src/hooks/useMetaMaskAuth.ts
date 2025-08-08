import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types/User';

interface MetaMaskAuthHook {
  isConnecting: boolean;
  connectWallet: () => Promise<User | null>;
  disconnectWallet: () => Promise<void>;
  error: string | null;
}

interface MetaMaskProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  isMetaMask?: boolean;
}

export const useMetaMaskAuth = (): MetaMaskAuthHook => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const connectWallet = useCallback(async (): Promise<User | null> => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      const ethereum = (window as any).ethereum as MetaMaskProvider | undefined;
      if (!ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access with timeout handling
      const accounts = await Promise.race([
        ethereum.request({
          method: 'eth_requestAccounts',
        }) as Promise<string[]>,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('User cancelled connection')), 60000)
        )
      ]);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const walletAddress = accounts[0];

      // Step 1: Authenticate directly with Firebase using wallet address
      const authResponse = await fetch('/api/auth/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
        }),
      });

      if (!authResponse.ok) {
        throw new Error('Failed to authenticate wallet');
      }

      const { customToken } = await authResponse.json();

      // Step 2: Sign in to Firebase with custom token
      const userCredential = await signInWithCustomToken(auth, customToken);
      const firebaseUser = userCredential.user;

      // Step 3: Get or create user document in Firestore
      const userDocRef = doc(db, 'users', walletAddress);
      const userDoc = await getDoc(userDocRef);

      let userData: User;

      if (userDoc.exists()) {
        // User exists, update last login
        const existingData = userDoc.data();
        userData = {
          walletAddress,
          username: existingData.username || '',
          email: existingData.email || '',
          createdAt: existingData.createdAt?.toDate() || new Date(),
          lastLogin: new Date(),
          referralId: existingData.referralId,
          telegramId: existingData.telegramId,
          photoUrl: existingData.photoUrl,
        };
        await setDoc(userDocRef, {
          ...userData,
          lastLogin: new Date(),
        }, { merge: true });
      } else {
        // New user, create document
        userData = {
          walletAddress,
          username: '',
          email: '',
          createdAt: new Date(),
          lastLogin: new Date(),
        };
        await setDoc(userDocRef, userData);
      }

      console.log('Successfully authenticated with MetaMask and Firebase');
      navigate('/dashboard');
      return userData;

    } catch (err) {
      console.error('MetaMask authentication error:', err);
      
      // Handle specific MetaMask error codes
      if ((err as any)?.code === 4001) {
        setError('Connection rejected by user');
      } else if ((err as any)?.code === -32002) {
        setError('MetaMask is already processing a request');
      } else if ((err as any)?.message?.includes('User cancelled')) {
        setError('Connection cancelled by user');
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(async (): Promise<void> => {
    try {
      await auth.signOut();
      console.log('Successfully disconnected wallet');
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }, []);

  return {
    isConnecting,
    connectWallet,
    disconnectWallet,
    error,
  };
};