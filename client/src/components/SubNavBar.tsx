import React from 'react';
import { Link } from 'react-router-dom';
import { FaExternalLinkAlt, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const SubNavBar: React.FC = () => {
  const { currentRoute } = useAuth();
  
  // Show guide-specific links when on guide page
  if (currentRoute === '/') {
    return (
    <div className="fixed w-full z-20 mt-14 bg-[#23263a]/80 border-t border-[#00ffe7]/30 py-4 shadow-[0_8px_12px_-8px_#faafe8] backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              to="/blog" 
              className="text-[#00ffe7] hover:text-[#ff005c] transition"
            >
              📝 Blog
            </Link>
            <a 
              href="#getting-started" 
              className="text-[#00ffe7] hover:text-[#ff005c] transition"
            >
              🚀 Getting Started
            </a>
            <a 
              href="#features" 
              className="text-[#00ffe7] hover:text-[#ff005c] transition"
            >
              ⚡ Features
            </a>
            <a 
              href="#faq" 
              className="text-[#00ffe7] hover:text-[#ff005c] transition"
            >
              ❓ FAQ
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Default navigation for other pages
  return (
    <div className="bg-[#23263a] border-t border-[#00ffe7]/30 py-2">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link 
            to="/guide" 
            className="text-[#00ffe7] hover:text-[#ff005c] transition"
          >
            📖 Guide
          </Link>
          <Link 
            to="/shop" 
            className="text-[#00ffe7] hover:text-[#ff005c] transition"
          >
            🛒 Bot Shop
          </Link>
          <Link 
            to="/support" 
            className="text-[#00ffe7] hover:text-[#ff005c] transition"
          >
            🆘 Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubNavBar;
