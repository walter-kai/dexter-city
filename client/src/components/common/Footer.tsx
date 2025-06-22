import React from 'react';
import { FaExternalLinkAlt, FaFileAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#181a23] border-t border-[#00ffe7]/30 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src="/logos/dexter3d.svg" className="h-8 mb-4" alt="DexterCity" />
            <p className="text-[#e0e7ef] text-sm mb-4">
              Trading made easy in the city.
            </p>
            <p className="text-[#e0e7ef] text-sm">
            © 2025 DexterCity. All rights reserved.
          </p>
          </div>
          <div>
            <h3 className="text-[#00ffe7] font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="https://docs.dextercity.com/whitepaper" className="flex items-center text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">
                Whitepaper <FaExternalLinkAlt className="text-xs ml-1" />
              </Link>
              <Link to="/guide" className="block text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">
                Guide
              </Link>
              <Link to="/x/contact" className="block text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">
                Contact us
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-[#00ffe7] font-bold mb-4">Legal</h3>
            <div className="space-y-2">
              <Link to="/legal/privacy-policy" className="block text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">
                Privacy Policy
              </Link>
              <Link to="/legal/terms-of-service" className="block text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">
                Terms of Service
              </Link>
              <Link to="/x/blog" className="block text-[#e0e7ef] hover:text-[#00ffe7] transition text-sm">
                Blog
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
