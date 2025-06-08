import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

interface NavLink {
  text: string;
  to: string;
  external?: boolean;
  isHash?: boolean;
}

const SubNavBar: React.FC = () => {
  const { currentRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Define navigation links for each route
  const getNavLinks = (): NavLink[] => {
    switch (currentRoute) {
      case '/':
        return [
          { text: '📝 BLOG', to: '/blog' },
          { text: '🚀 GET STARTED', to: '#getting-started', isHash: true },
          { text: '⚡ FEATURES', to: '#features', isHash: true },
          { text: '✉️ CONTACT US', to: '/contact' }
        ];
      
      case '/blog':
        return [
          { text: '🏠 Home', to: '/' },
          { text: '🚀 GET STARTED', to: '/#getting-started', isHash: true },
          { text: '⚡ FEATURES', to: '/#features', isHash: true },
          { text: '✉️ CONTACT US', to: '/contact' }
        ];
      
      default:
        return [
          { text: '📖 Guide', to: '/' },
          { text: '🛒 Bot Shop', to: '/shop' },
          { text: '🆘 Support', to: '/support' }
        ];
    }
  };

  const handleClick = (link: NavLink) => {
    if (link.isHash) {
      const sectionId = link.to.replace('#', '').replace('/#', '');
      
      // If we're on the same page and it's a hash link
      if (currentRoute === '/' && link.to.startsWith('#')) {
        // Prevent default navigation and scroll to section with offset
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop + 450; // Adjust for navbar height
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
        return;
      }
      
      // If we're on a different page, navigate then scroll
      if (link.to.startsWith('/#')) {
        navigate('/');
        // Wait for navigation to complete, then scroll
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            const offsetTop = element.offsetTop + 450; // Adjust for navbar height
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
        }, 100);
        return;
      }
    }
    
    // Default navigation for non-hash links
    navigate(link.to);
  };

  const navLinks = getNavLinks();
  const isHomePage = currentRoute === '/';

  return (
    <div className={`fixed w-full z-20 mt-14 bg-[#23263a]/80 border-t border-[#00ffe7]/30 ${isHomePage ? 'my-4' : ''} shadow-[0_8px_12px_-8px_#faafe8] backdrop-blur-md`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-4 text-sm h-16">
          {navLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => handleClick(link)}
              className="btn-nav flex items-center justify-center h-full min-w-32 text-center uppercase cursor-pointer"
            >
              {link.text} {link.external && <FaExternalLinkAlt className="ml-1 text-xs" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubNavBar;
