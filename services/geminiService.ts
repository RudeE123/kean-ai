
import { GoogleGenAI } from "@google/genai";
import { ImageAspectRatio, VideoAspectRatio, VideoResolution } from '../types';

const checkApiKey = async (): Promise<boolean> => {
  if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
    return await window.aistudio.hasSelectedApiKey();
  }
  // Fallback or default behavior if aistudio is not available
  return process.env.API_KEY ? true : false;
};


export const generateImage = async (prompt: string, aspectRatio: ImageAspectRatio): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is not configured. Please set the API_KEY environment variable.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    }
    throw new Error("Image generation failed or returned no images.");
};


export const generateVideo = async (
    prompt: string,
    aspectRatio: VideoAspectRatio,
    resolution: VideoResolution,
    onProgress: (message: string) => void
): Promise<string> => {
    const hasKey = await checkApiKey();
    if (!hasKey) {
        throw new Error("API key not selected. Please select an API key to generate videos.");
    }
    
    if (!process.env.API_KEY) {
        throw new Error("API key is missing after selection. Please try again.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    onProgress("Initializing video generation...");
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: resolution,
            aspectRatio: aspectRatio,
        }
    });

    const progressMessages = [
        "Warming up the digital canvas...",
        "Rendering pixels into motion...",
        "Composing the opening scene...",
        "Almost there, adding finishing touches...",
        "Finalizing your masterpiece..."
    ];
    let messageIndex = 0;

    while (!operation.done) {
        onProgress(progressMessages[messageIndex % progressMessages.length]);
        messageIndex++;
        await new Promise(resolve => setTimeout(resolve, 10000));
        try {
            operation = await ai.operations.getVideosOperation({ operation: operation });
        } catch (e: any) {
            if (e.message?.includes("Requested entity was not found")) {
                throw new Error("API key error. Please re-select your API key and try again.");
            }
            throw e; // Re-throw other errors
        }
    }

    onProgress("Fetching generated video...");
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download the video. Status: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};
