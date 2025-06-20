import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/styles.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import { MetaMaskProvider } from '@metamask/sdk-react';
import { AuthProvider } from './contexts/AuthContext';
import { BalanceProvider } from './contexts/BalanceProvider';
import { PoolProvider } from './contexts/PoolContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <Router>
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "DexterCity",
          url: window.location.href,
        },
      }}
    >
      <AuthProvider>
        <BalanceProvider>
          <PoolProvider>
            <App />
          </PoolProvider>
        </BalanceProvider>
      </AuthProvider>
    </MetaMaskProvider>
  </Router>
);

reportWebVitals();
