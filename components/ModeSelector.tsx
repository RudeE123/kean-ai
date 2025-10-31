
import React from 'react';
import { Mode } from '../types';

interface ModeSelectorProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex justify-center bg-gray-800 rounded-full p-1 max-w-xs mx-auto">
      {Object.values(Mode).map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`w-full text-center px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 ${
            currentMode === mode
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;
