import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LoadingScreenDots = () => {

  return (
    <div className={`w-full items-center relative`}>
    <DotLottieReact
        src='wallet.lottie'
        className="w-[100px] pt-32"
        loop
        autoplay
        speed={0.8}
      />
    </div>
  );
};

export default LoadingScreenDots;