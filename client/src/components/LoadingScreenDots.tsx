import React, { useState, useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

const LoadingScreenDots = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 50); // 50ms delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full items-center relative`}>
      <Player
        src='lottie/lottie-loadingDots.json'
        className="w-[80px]"
        loop
        autoplay
        speed={0.8}
      />
    </div>
  );
};

export default LoadingScreenDots;