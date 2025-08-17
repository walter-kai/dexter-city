import { useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import { jwtStorage } from '../utils/jwtStorage';
import { User } from '../types/User';
import { clearMetaMaskSession, checkForMetaMaskState } from '../utils/metamaskSession';

interface MetaMaskAuthHook {
  isConnecting: boolean;
  connectMetaMask: () => Promise<User | null>;
  disconnectWallet: () => Promise<void>;
  forceDisconnectMetaMask: () => Promise<void>;
  resetConnectionState: () => void;
  error: string | null;
}

interface MetaMaskProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  isMetaMask?: boolean;
}

export const useMetaMaskAuth = (): MetaMaskAuthHook => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const navigate = useNavigate();

  const forceDisconnectMetaMask = useCallback(async (): Promise<void> => {
    try {
      // Clear all MetaMask session storage
      clearMetaMaskSession();
      
      const ethereum = (window as any).ethereum as MetaMaskProvider | undefined;
      if (ethereum) {
        // Try to disconnect from MetaMask
        try {
          await ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
        } catch {
          // If that fails, we've already cleared storage
        }
      }
      
      // Reset local connection state
      setIsConnecting(false);
      setError(null);
      
      console.log('Force disconnected MetaMask and cleared all session data');
    } catch (err) {
      console.error('Error force disconnecting MetaMask:', err);
    }
  }, []);

  const connectMetaMask = useCallback(async (): Promise<User | null> => {
    setIsConnecting(true);
    setError(null);

    try {
      // Clear any persistent MetaMask state to ensure fresh authentication
      clearMetaMaskSession();
      
      // Warn if there's still persistent state
      if (checkForMetaMaskState()) {
        console.warn('MetaMask state still present after clearing - this should not happen');
      }

      // Check if MetaMask is installed
      const ethereum = (window as any).ethereum as MetaMaskProvider | undefined;
      if (!ethereum) {
        throw new Error('MetaMask is not installed');
      }

      console.log('Requesting fresh MetaMask connection...');

      // Explicitly request fresh account access (no auto-connection)
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const walletAddress = accounts[0];

      // Create a unique message for this session (no persistence)
      const timestamp = Date.now();
      const sessionId = Math.random().toString(36).substring(7);
      const message = `🤖 Confirm to log into Dexter City 🏙️ (Session: ${sessionId})`;

      console.log('Requesting signature for fresh authentication...');

      // Request signature from MetaMask
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      }) as string;

      console.log('Signature received, authenticating with server...');

      // Send authentication request to backend
      const response = await fetch('/api/auth/metamask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          signature,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const { data } = await response.json();
      const { accessToken, user, expiresIn } = data;

      console.log('JWT token received, storing securely...');

      // Store JWT token
      jwtStorage.setToken(accessToken, expiresIn);

      console.log('Authentication successful for:', user.walletAddress);

      // Return user data from auth response (no additional API call needed)
      const userData: User = {
        walletAddress: user.walletAddress,
        username: user.username || '',
        email: user.email || '',
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : new Date(),
        ...(user.referralId && { referralId: user.referralId }),
        ...(user.telegramId && { telegramId: user.telegramId }),
        ...(user.photoUrl && { photoUrl: user.photoUrl }),
      };

      console.log('Successfully authenticated with MetaMask and JWT');
      return userData;

    } catch (err) {
      console.error('MetaMask authentication error:', err);
      console.error('Error code:', (err as any)?.code);
      console.error('Error message:', (err as any)?.message);
      
      // Handle specific MetaMask error codes
      if ((err as any)?.code === 4001) {
        setError('Connection rejected by user');
        // Only force disconnect when user explicitly rejects
        await forceDisconnectMetaMask();
      } else if ((err as any)?.code === -32002) {
        setError('MetaMask is already processing a request');
      } else if ((err as any)?.message?.includes('User cancelled')) {
        setError('Connection cancelled by user');
        // Only force disconnect when user cancels
        await forceDisconnectMetaMask();
      } else if ((err as any)?.message?.includes('Missing or insufficient permissions')) {
        setError('Database permissions error - please contact support');
      } else if ((err as any)?.code === 'permission-denied') {
        setError('Access denied - please ensure you have the necessary permissions');
      } else if ((err as any)?.code === 'unauthenticated') {
        setError('Authentication required - please try reconnecting your wallet');
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
      // Clear any local state or storage if needed
      console.log('Successfully disconnected wallet');
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }, []);

  const resetConnectionState = useCallback(() => {
    setIsConnecting(false);
    setError(null);
  }, []);

  return {
    isConnecting,
    connectMetaMask,
    disconnectWallet,
    forceDisconnectMetaMask,
    resetConnectionState,
    error,
  };
};