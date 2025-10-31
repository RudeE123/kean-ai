
import React from 'react';
import { Mode } from '../types';

interface ResultDisplayProps {
  mode: Mode;
  isLoading: boolean;
  loadingMessage: string;
  resultUrl: string | null;
  error: string | null;
  prompt: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ mode, isLoading, loadingMessage, resultUrl, error, prompt }) => {
  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-gray-800 rounded-lg flex flex-col justify-center items-center text-center p-4">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
        <p className="mt-4 text-lg font-semibold">{loadingMessage}</p>
        <p className="mt-2 text-gray-400 text-sm max-w-md truncate">Generating: "{prompt}"</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-video bg-red-900/20 border border-red-500 rounded-lg flex flex-col justify-center items-center text-center p-4">
        <h3 className="text-red-400 text-xl font-bold">Generation Failed</h3>
        <p className="mt-2 text-red-300">{error}</p>
      </div>
    );
  }

  if (resultUrl) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
        {mode === Mode.Image ? (
          <img src={resultUrl} alt={prompt} className="w-full h-full object-contain" />
        ) : (
          <video src={resultUrl} controls autoPlay loop className="w-full h-full object-contain">
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg flex justify-center items-center text-center p-4">
      <p className="text-gray-500">Your generated masterpiece will appear here.</p>
    </div>
  );
};

export default ResultDisplay;
