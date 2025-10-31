
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center p-4 md:p-6">
      <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Kean AI
      </h1>
      <p className="text-gray-400 mt-2">Your personal AI Image & Video Generator</p>
    </header>
  );
};

export default Header;
