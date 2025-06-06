import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { routes } from './models/Routes';
import NavBar from './components/NavBar';
import { useSDK } from '@metamask/sdk-react';
import { login } from './hooks/FirestoreUser';
import { useNavigate } from 'react-router-dom';
import ShopDetail from './pages/ShopDetail';
import OnboardForm from './pages/OnboardForm';

// Wrapper for ShopDetail to provide default props
const WrappedShopDetail = (props: any) => {
  const defaultBot = {
    id: '1',
    name: 'Default Bot',
    description: 'This is a default bot description.',
    price: 0,
    image: 'https://via.placeholder.com/150',
  };
  return <ShopDetail bot={props.bot || defaultBot} />;
};

// Wrapper for OnboardForm to provide default props
const WrappedOnboardForm = (props: any) => {
  const handleComplete = (chosenName: string, favoriteSport: string[]) => {
    console.log('Onboarding complete:', { chosenName, favoriteSport });
  };
  return <OnboardForm onComplete={props.onComplete || handleComplete} />;
};

// Update componentMap to use wrapped components
const componentMap: Record<string, React.LazyExoticComponent<React.FC>> = {
  Build: React.lazy(() => import('./pages/Build')),
  Dashboard: React.lazy(() => import('./pages/Dashboard')),
  UserGuide: React.lazy(() => import('./pages/Guide')),
  Support: React.lazy(() => import('./pages/Support')),
  ShopDetail: React.lazy(() => Promise.resolve({ default: WrappedShopDetail })),
  Shop: React.lazy(() => import('./pages/Shop')),
  Share: React.lazy(() => import('./pages/Share')),
  Search: React.lazy(() => import('./pages/Search')),
  Quit: React.lazy(() => import('./pages/Quit')),
  Profile: React.lazy(() => import('./pages/Profile')),
  OnboardForm: React.lazy(() => Promise.resolve({ default: WrappedOnboardForm })),
  NotFound: React.lazy(() => import('./pages/NotFound')),
  MyBots: React.lazy(() => import('./pages/MyBots')),
  Home: React.lazy(() => import('./pages/Home')),
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const { connected, sdk } = useSDK();
  const navigate = useNavigate();
  const location = useLocation();

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
        console.error('MetaMask SDK not initialized.');
        return;
      }
      const accounts = await sdk.connect();
      if (accounts && accounts.length > 0) {
        const walletId = accounts[0];
        console.log('Connected account:', walletId);

        const user = await login(walletId);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        navigate('/dash');
      } else {
        console.log('No accounts found.');
      }
    } catch (err) {
      console.error('Failed to connect MetaMask:', err);
    }
  };

  return (
    <div className="bg-gradient-to-bl from-gray-800 to-[#7c8aaf]">
      {location.pathname !== '/' && <NavBar telegramUser={user} />}
      <div className="mx-auto py-12">
        <Routes>
          {routes.map(({ path, component }) => {
            const Component = componentMap[component];
            if (!Component) {
              return null;
            }
            return (
              <Route
                key={path}
                path={path}
                element={
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <Component />
                  </React.Suspense>
                }
              />
            );
          })}
        </Routes>
      </div>
    </div>
  );
};

export default App;
