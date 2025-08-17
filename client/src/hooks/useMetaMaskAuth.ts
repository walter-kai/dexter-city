import { useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useSDK } from "@metamask/sdk-react";
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
  removeAllListeners?: () => void;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

export const useMetaMaskAuth = (): MetaMaskAuthHook => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sdk, connected, connecting } = useSDK();
  // const navigate = useNavigate();

  const forceDisconnectMetaMask = useCallback(async (): Promise<void> => {
    try {
      console.log('Starting force disconnect from MetaMask...');
      
      // 1. Clear JWT authentication tokens first
      jwtStorage.forceLogout();
      
      // 2. Disconnect from MetaMask SDK if available
      if (sdk && connected) {
        try {
          await sdk.disconnect();
          console.log('MetaMask SDK disconnected');
        } catch (sdkError) {
          console.warn('SDK disconnect failed:', sdkError);
        }
      }
      
      // 3. Clear all MetaMask session storage
      clearMetaMaskSession();
      
      // 4. Try to revoke permissions from MetaMask provider
      const ethereum = (window as any).ethereum as MetaMaskProvider | undefined;
      if (ethereum && ethereum.isMetaMask) {
        try {
          // Request to revoke permissions (this will prompt user to disconnect)
          await ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }]
          });
          console.log('MetaMask permissions revoked');
        } catch (revokeError) {
          // Fallback: Try to request fresh permissions (forces reconnection)
          try {
            await ethereum.request({
              method: 'wallet_requestPermissions',
              params: [{ eth_accounts: {} }]
            });
            console.log('Requested fresh MetaMask permissions');
          } catch (permError) {
            console.warn('Could not revoke or refresh permissions:', permError);
          }
        }
      }
      
      // 5. Reset all local component state
      setIsConnecting(false);
      setError(null);
      
      // 6. Additional cleanup - remove any ethereum event listeners
      if (ethereum) {
        try {
          // Remove all listeners that might be attached
          ethereum.removeAllListeners?.();
        } catch (listenerError) {
          console.warn('Could not remove ethereum listeners:', listenerError);
        }
      }
      
      console.log('✅ Force disconnect completed - all MetaMask data cleared');
      
    } catch (err) {
      console.error('❌ Error during force disconnect:', err);
      // Even if there's an error, ensure local state is cleared
      setIsConnecting(false);
      setError(null);
    }
  }, [sdk, connected]);

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
      // let message = `🌃 🤖Dexter City needs your wallet ID🦾 🏙️`;

      // First, request account access from MetaMask (this will prompt user if not connected)
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
        // params: [message, ],
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts available in MetaMask');
      }

      // Create a unique message for this session (no persistence)
      const timestamp = Date.now();
      const sessionId = Math.random().toString(36).substring(7);
      const message = `🌃 Confirm to enter Dexter City 🦾🤖`;

      console.log('Requesting signature for authentication...');

      // Request signature from MetaMask using the connected account
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, accounts[0]], // Use the first connected account
      }) as string;

      console.log('Signature received, authenticating with server...');

      // Prepare request body
      const requestBody = {
        walletAddress: accounts[0],
        signature,
        message,
      };

      console.log('Sending auth request with:', requestBody);

      // Send authentication request to backend with wallet address, signature, and message
      const response = await fetch('/api/auth/metamask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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
      console.log('Disconnecting wallet...');
      
      // Clear JWT tokens
      jwtStorage.clearToken();
      
      // Clear MetaMask session data
      clearMetaMaskSession();
      
      // Reset local state
      setIsConnecting(false);
      setError(null);
      
      console.log('✅ Wallet disconnected successfully');
    } catch (err) {
      console.error('❌ Error disconnecting wallet:', err);
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