import React, { useState, useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

const LoadingScreenDots = () => {
  const [visible, setVisible] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 50); // 50ms delay

    return () => clearTimeout(timer);
  }, []);

  const handleError = () => {
    console.error('Lottie animation failed to load');
    setHasError(true);
  };

  // Fallback CSS animation if Lottie fails
  if (hasError) {
    return (
      <div className="w-full items-center relative">
        <div className="flex justify-center items-center space-x-1">
          <div className="w-2 h-2 bg-[#00ffe7] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#00ffe7] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#00ffe7] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full items-center relative`}>
      <Player
        src='lottie/lottie-loadingDots.json'
        className="w-[80px]"
        loop
        autoplay
        speed={0.8}
        onEvent={(event) => {
          if (event === 'error') {
            handleError();
          }
        }}
      />
    </div>
  );
};

export default LoadingScreenDots;