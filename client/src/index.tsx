import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/styles.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import { MetaMaskProvider } from '@metamask/sdk-react';
import { AuthProvider } from './providers/AuthContext';
import { BalanceProvider } from './providers/BalanceProvider';
import { PoolProvider } from './providers/PoolContext';
import { TrendingCoinsProvider } from './providers/TrendingCoinsContext';

// Clear any persistent MetaMask SDK storage on app startup
// This prevents unwanted auto-reconnections
const clearMetaMaskStorage = () => {
  try {
    // Clear localStorage entries related to MetaMask SDK
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('metamask') || key.includes('sdk') || key.includes('MM_SDK'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage entries related to MetaMask SDK  
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('metamask') || key.includes('sdk') || key.includes('MM_SDK'))) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    console.log('Cleared MetaMask SDK storage for fresh session');
  } catch (error) {
    console.warn('Could not clear MetaMask storage:', error);
  }
};

// Clear storage on app startup
clearMetaMaskStorage();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <Router>
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "Dexter City",
          url: window.location.href,
        },
        // Disable persistent storage to prevent auto-reconnection
        storage: {
          enabled: false,
        },
        // Force fresh connection each time
        checkInstallationImmediately: false,
        checkInstallationOnAllCalls: false,
      }}
    >
      <AuthProvider>
        <BalanceProvider>
          <PoolProvider>
            <TrendingCoinsProvider>
              <App />
            </TrendingCoinsProvider>
          </PoolProvider>
        </BalanceProvider>
      </AuthProvider>
    </MetaMaskProvider>
  </Router>
);

reportWebVitals();
