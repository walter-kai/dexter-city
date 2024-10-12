import './styles/styles.css'
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Search from './pages/Search';
import Trending from './pages/Trending';
import Share from './pages/Share';
import UserGuide from './pages/UserGuide';
import Support from './pages/Support';
import NotFound from './pages/NotFound';
import Quit from './pages/Quit';
import Profile from './pages/Profile';
import { useToken } from './services/TokenProvider';
import { FaSearch, FaFileSignature, FaUser, FaStar } from 'react-icons/fa';
import { Hootsuite } from './services/Hootsuite';
import { useOAuth } from './services/OauthProvider';


const App: React.FC = () => {
  const navigate = useNavigate(); // Hook for navigation
  const { privateToken, fetchPublicToken } = useToken();

  useEffect(() => {
    Hootsuite.init(); // Initialize Hootsuite SDK when the component mounts
    fetchPublicToken();
  }, []);

  const { initiateOAuth } = useOAuth();  

  const handleLogin = () => {
    initiateOAuth();
  };

  return (
    <div className="max-w-[98%] mx-auto">
      {/* Top Bar */}
      <div className="fixed bg-[#fdfdfd] z-20 left-0 w-full top-0 flex py-2 items-center">
        <button 
          className="btn-nav" 
          type="button" 
          onClick={() => navigate('/profile')}
        >
          <FaUser className="text-xl" />
        </button>
        <button 
          className="btn-nav" 
          type="button" 
          onClick={() => navigate('/trending')}
        >
          <FaStar className="text-xl" />
        </button>
        <button 
          className="btn-nav" 
          type="button" 
          onClick={() => navigate('/')}
        >
          <FaSearch className="text-xl" />
        </button>
        <button 
          className="btn-nav" 
          type="button" 
          onClick={() => navigate('/share')}
        >
          <FaFileSignature className="text-xl" />
        </button>

        {privateToken ? (
          <div className="ml-auto pr-4 flex items-center space-x-2">
            <span className="text-[#b8ec51e6] font-semibold">Connected</span>
          </div>
        ) : (
          <div className="ml-auto pr-4 flex items-center space-x-2">
          {/* <span className="text-[#FF4342] font-semibold">Log in</span> */}
          <button type="button" onClick={handleLogin} className="btn-teal text-sm px-4 w-[100px]">
            Log in
          </button>
        </div>
        )}
      </div>

      {/* Main Routes */}
      <div className="mt-[46px]">
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/share" element={<Share />} />
          <Route path="/user-guide" element={<UserGuide />} />
          <Route path="/support" element={<Support />} />
          <Route path="/quit" element={<Quit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
