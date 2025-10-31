import React, { useState, useEffect, useCallback } from 'react';

// This is a global declaration to inform TypeScript about the `aistudio` object
// Fix: Define a named interface for the aistudio object to avoid type conflicts with other global declarations.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}
declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  const checkKey = useCallback(async () => {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const keyStatus = await window.aistudio.hasSelectedApiKey();
      setHasKey(keyStatus);
      if (keyStatus) {
        onKeySelected();
      }
    } else {
        // If aistudio is not available, assume key is set via env var
        setHasKey(true);
        onKeySelected();
    }
  }, [onKeySelected]);

  useEffect(() => {
    checkKey();
  }, [checkKey]);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume success and optimistically update UI
      setHasKey(true);
      onKeySelected();
    } else {
      alert("API Key selection utility is not available in this environment.");
    }
  };

  if (hasKey) {
    return null; // Key is selected, render nothing
  }

  if (hasKey === null) {
      return <div className="text-center p-4 text-gray-400">Checking API key status...</div>
  }

  return (
    <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-6 text-center shadow-lg animate-fade-in">
      <h3 className="text-xl font-semibold text-white mb-2">API Key Required for Video Generation</h3>
      <p className="text-gray-400 mb-4">
        To use the video generation feature, you need to select an API key. This will be used for billing purposes.
      </p>
      <button
        onClick={handleSelectKey}
        className="bg-purple-600 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
      >
        Select API Key
      </button>
       <p className="text-xs text-gray-500 mt-4">
        For more information on billing, visit{' '}
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-purple-400"
        >
          ai.google.dev/gemini-api/docs/billing
        </a>.
      </p>
    </div>
  );
};

export default ApiKeySelector;