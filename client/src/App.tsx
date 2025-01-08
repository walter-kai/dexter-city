import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; // Import useLocation
import { routes } from './models/Routes';
import './styles/styles.css';
import NavBar from './components/NavBar';
import { useSDK } from '@metamask/sdk-react';
import { login } from './services/FirestoreUser';
import { useNavigate } from 'react-router-dom';
import { client } from './services/SubGraph';
import { Provider } from 'urql';
import websocketService from './services/WebSocket';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null); // Adjust based on your actual user type
  const { connected, sdk } = useSDK();
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route

  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser && storedUser !== 'undefined') {
      setUser(JSON.parse(storedUser));
    } else {
      connectWallet();
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!sdk) {
        console.error("MetaMask SDK not initialized.");
        return;
      }
      const accounts = await sdk.connect();
      if (accounts && accounts.length > 0) {
        const walletId = accounts[0];
        console.log("Connected account:", walletId);

        const user = await login(walletId);
        sessionStorage.setItem("currentUser", JSON.stringify(user));
        navigate("/dash");
      } else {
        console.log("No accounts found.");
      }
    } catch (err) {
      console.error("Failed to connect MetaMask:", err);
    }
  };

  return (
      <Provider value={client}>
    
    <div className="bg-gradient-to-bl from-[#343949] to-[#7c8aaf] h-screen">
      {/* Show NavBar only if not on the "/" route */}
      {location.pathname !== '/' && <NavBar telegramUser={user} />}
      <div className="mx-auto pt-12">
        <Routes>
          {routes.map(({ path, component }) => {
            const Component = require(`./pages/${component}`).default;
            return <Route key={path} path={path} element={<Component />} />;
          })}
        </Routes>
      </div>
    </div>
    </Provider>
  );
};

export default App;
