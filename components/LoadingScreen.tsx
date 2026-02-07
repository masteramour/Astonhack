
import React from 'react';
import { OctopusLogo } from '../constants';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-brand flex flex-col items-center justify-center z-50">
      <div className="relative">
        <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-150 animate-pulse"></div>
        <OctopusLogo className="w-32 h-32 text-white animate-drift relative z-10" />
      </div>
      <h1 className="text-white text-4xl font-bold mt-8 tracking-wider">8vents</h1>
      <p className="text-white/80 mt-2 font-medium">Getting everything ready for you...</p>
      
      <div className="mt-12 flex space-x-2">
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
