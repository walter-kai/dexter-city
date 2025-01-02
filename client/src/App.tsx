import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { routes } from './models/Routes'; // Import routes
import './styles/styles.css';
import OnboardForm from './pages/OnboardForm';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import NavBar from './components/NavBar';
import { useSDK } from '@metamask/sdk-react';

const App: React.FC = () => {
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [user, setUser] = useState<any>(null); // Adjust this based on your actual user type
  const { connected } = useSDK(); // Use the SDK's connection status

  const handleCompleteOnboarding = (chosenName: string, favoriteSport: string[]) => {
    console.log('Onboarding complete with name:', chosenName, 'and favorite sports:', favoriteSport);
    setIsOnboarding(false); // Update the onboarding state
  };

  useEffect(() => {
    // Check if the user is in sessionStorage
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser && storedUser !== 'undefined') {
      setUser(JSON.parse(storedUser)); // Parse and set user from sessionStorage
    }
  }, []);

  return (
    <div className="bg-gradient-to-bl from-[#343949] to-[#7c8aaf] h-screen">
      {connected && <NavBar telegramUser={user} />}
      <div className="mx-auto">
        {isOnboarding ? (
          <DndProvider backend={HTML5Backend}>
            <OnboardForm onComplete={handleCompleteOnboarding} />
          </DndProvider>
        ) : (
          <Routes>
            {routes.map(({ path, component }) => {
              const Component = require(`./pages/${component}`).default;
              return <Route key={path} path={path} element={<Component />} />;
            })}
          </Routes>
        )}
      </div>
    </div>
  );
};

export default App;
