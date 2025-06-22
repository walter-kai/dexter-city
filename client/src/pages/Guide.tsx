import React from 'react';
import GetStarted from '../components/guide/GetStarted';
import Features from '../components/guide/Features';

const Guide: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-8 pt-24">
      <GetStarted />
      <Features />
    </main>
  );
};

export default Guide;
