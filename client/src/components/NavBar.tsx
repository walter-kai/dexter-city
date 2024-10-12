// NavBar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFileSignature, FaUser, FaStar } from 'react-icons/fa';

interface NavBarProps {
  telegramUser: { id: string; first_name: string };
  onLogin: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ telegramUser, onLogin }) => {
  const navigate = useNavigate();

  return (
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

      {telegramUser.id ? (
        <div className="ml-auto pr-4 flex items-center space-x-2">
          <span className="text-[#b8ec51e6] font-semibold">{telegramUser.first_name} Connected</span>
        </div>
      ) : (
        <div className="ml-auto pr-4 flex items-center space-x-2">
          <button type="button" onClick={onLogin} className="btn-teal text-sm px-4 w-[100px]">
            Log in
          </button>
        </div>
      )}
    </div>
  );
};

export default NavBar;
