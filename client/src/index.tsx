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
