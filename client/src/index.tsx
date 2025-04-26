import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/styles.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { TokenProvider } from './services/TokenProvider';
import { OAuthProvider } from './services/OauthProvider';
import { BrowserRouter as Router } from 'react-router-dom';
import { MetaMaskProvider } from "@metamask/sdk-react"



// import { Post } from './components/PostList';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
  <MetaMaskProvider
  sdkOptions={{
    dappMetadata: {
      name: "Dexter",
      url: window.location.href,
    },
    // infuraAPIKey: process.env.INFURA_API_KEY,
    // Other options.
  }}
>
    <TokenProvider>
      <OAuthProvider>
        <Router>
          <App />
        </Router>  
      </OAuthProvider>
    </TokenProvider>
</MetaMaskProvider>

  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
