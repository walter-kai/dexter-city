import React from 'react';


interface BinanceButtonProps {
  clientId: string;
  redirectUri: string;
  state?: string;
  scope: string;
  className?: string; // for additional custom styles
}

const BinanceButton: React.FC<BinanceButtonProps> = ({ clientId, redirectUri, state = '', scope, className = '' }) => {
  const handleClick = async () => {
    try {
      // Make a request to your server to get the Binance authorization URL
      const response = await fetch('/api/binance/authorize', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientId, redirectUri, state, scope }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch authorization URL');
      }

      const data = await response.json();
      const authUrl = data.data;

      // Open a popup window with the returned authorization URL
      const width = 600;
      const height = 800;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;

      const popup = window.open(
        authUrl,
        'Binance Authorization',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
      );

      if (!popup) {
        throw new Error('Failed to open popup window');
      }
    } catch (error) {
      console.error(error);
      alert('Error initiating authorization');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-200 hover:bg-yellow-700 flex items-center justify-center space-x-2 ${className}`}
    >
      <span>Authorize</span>
    </button>
  );
};

export default BinanceButton;
