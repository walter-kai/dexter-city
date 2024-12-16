import './styles/styles.css';
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Trending from './pages/Trending';
import Share from './pages/Share';
import UserGuide from './pages/UserGuide';
import Support from './pages/Support';
import NotFound from './pages/NotFound';
import Quit from './pages/Quit';
import Profile from './pages/Profile';
import OnboardForm from './pages/OnboardForm';
import Dashboard from './pages/Dashboard';
import { login } from './services/FirestoreUser'; // Import newUser function
import User from "./models/User";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import LoadingScreenDots from './components/LoadingScreenDots';
import Login from './pages/Login';

const App: React.FC = () => {




  return (
    <div className="mx-auto">

        <>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dash" element={<Dashboard />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/share" element={<Share />} />
            <Route path="/howitworks" element={<UserGuide />} />
            <Route path="/user-guide" element={<UserGuide />} />
            <Route path="/support" element={<Support />} />
            <Route path="/quit" element={<Quit />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </>
      
    </div>
  );
};

export default App;
