
import React, { useState, useCallback } from 'react';
import { Mode, ImageAspectRatio, VideoAspectRatio, VideoResolution } from './types';
import { generateImage, generateVideo } from './services/geminiService';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import ResultDisplay from './components/ResultDisplay';
import ApiKeySelector from './components/ApiKeySelector';

// Define components outside of App to prevent re-creation on re-renders
const OptionSelector = <T,>({ label, options, selected, onChange }: { label: string, options: T[], selected: T, onChange: (value: T) => void }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <button
                    key={String(option)}
                    onClick={() => onChange(option)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                        selected === option ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    {String(option)}
                </button>
            ))}
        </div>
    </div>
);

const App: React.FC = () => {
    const [mode, setMode] = useState<Mode>(Mode.Image);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Image settings
    const [imageAspectRatio, setImageAspectRatio] = useState<ImageAspectRatio>('1:1');
    const imageAspectRatios: ImageAspectRatio[] = ['1:1', '3:4', '4:3', '16:9', '9:16'];

    // Video settings
    const [videoAspectRatio, setVideoAspectRatio] = useState<VideoAspectRatio>('16:9');
    const videoAspectRatios: VideoAspectRatio[] = ['16:9', '9:16'];
    const [videoResolution, setVideoResolution] = useState<VideoResolution>('720p');
    const videoResolutions: VideoResolution[] = ['720p', '1080p'];

    const [isApiKeySelected, setIsApiKeySelected] = useState(false);

    const handleGeneration = useCallback(async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt.");
            return;
        }

        setIsLoading(true);
        setResultUrl(null);
        setError(null);

        try {
            if (mode === Mode.Image) {
                setLoadingMessage("Generating your image...");
                const url = await generateImage(prompt, imageAspectRatio);
                setResultUrl(url);
            } else if (mode === Mode.Video) {
                 if (!isApiKeySelected) {
                    setError("Please select an API key before generating a video.");
                    setIsLoading(false);
                    return;
                }
                setLoadingMessage("Initiating video generation...");
                const url = await generateVideo(prompt, videoAspectRatio, videoResolution, setLoadingMessage);
                setResultUrl(url);
            }
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
            if (e.message?.includes("API key error")) {
                setIsApiKeySelected(false); // Force re-selection on key error
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [prompt, mode, imageAspectRatio, videoAspectRatio, videoResolution, isApiKeySelected]);
    
    const handleModeChange = (newMode: Mode) => {
        setMode(newMode);
        setResultUrl(null);
        setError(null);
    }
    
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
                <div className="w-full max-w-3xl space-y-8">
                    <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
                    
                    <div className="bg-gray-800/50 p-4 rounded-lg space-y-4">
                         {mode === Mode.Video && !isApiKeySelected && (
                            <ApiKeySelector onKeySelected={() => setIsApiKeySelected(true)} />
                         )}
                         {(mode === Mode.Image || isApiKeySelected) && (
                            <>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={mode === Mode.Image ? "e.g., A robot holding a red skateboard." : "e.g., A neon hologram of a cat driving at top speed."}
                                    className="w-full h-24 p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                                    disabled={isLoading}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {mode === Mode.Image ? (
                                        <OptionSelector label="Aspect Ratio" options={imageAspectRatios} selected={imageAspectRatio} onChange={setImageAspectRatio} />
                                    ) : (
                                        <>
                                            <OptionSelector label="Aspect Ratio" options={videoAspectRatios} selected={videoAspectRatio} onChange={setVideoAspectRatio} />
                                            <OptionSelector label="Resolution" options={videoResolutions} selected={videoResolution} onChange={setVideoResolution} />
                                        </>
                                    )}
                                </div>
                             </>
                         )}
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handleGeneration}
                            disabled={isLoading || (mode === Mode.Video && !isApiKeySelected)}
                            className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-12 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center space-x-2"
                        >
                            {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                            <span>{isLoading ? 'Generating...' : 'Generate'}</span>
                        </button>
                    </div>

                    <ResultDisplay
                        mode={mode}
                        isLoading={isLoading}
                        loadingMessage={loadingMessage}
                        resultUrl={resultUrl}
                        error={error}
                        prompt={prompt}
                    />
                </div>
            </main>
             <footer className="text-center p-4 text-gray-500 text-sm">
                <p>Powered by Google Gemini. Created for demonstration purposes.</p>
            </footer>
        </div>
    );
};

export default App;

