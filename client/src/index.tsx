import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/styles.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import { TokenProvider } from './hooks/TokenProvider';
// import { OAuthProvider } from './hooks/OauthProvider';
import { BrowserRouter as Router } from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <TokenProvider>
    // <OAuthProvider>
      <Router>
        <App />
      </Router>  
    // </OAuthProvider>
  // </TokenProvider>
);

reportWebVitals();
