





import React, { useEffect, useState } from 'react';
import { Page } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { useSettings } from '../context/SettingsContext';
import { useLog } from '../hooks/useLog';
import { generateImagePrompt } from '../services/geminiService';
import { generateImage } from '../services/imagenService';
import { NavigationButtons } from '../components/common/NavigationButtons';
import { Modal } from '../components/Modal';
import { LogLevel } from '../types';
import { playBeep } from '../utils/audio';

interface CoverImagePageProps {
  setPage: (page: Page) => void;
}

export const CoverImagePage: React.FC<CoverImagePageProps> = ({ setPage }) => {
    const { state, addCoverImagePrompt, addCoverImageUrl, setCoverImagePrompts, setCoverImageUrls, setSelectedCoverImageIndex, setImageGenerationSkipped, isLoading, setIsLoading } = useGenerationContext();
    const { apiKey } = useSettings();
    const log = useLog();
    const [error, setError] = useState('');
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    
    useEffect(() => {
        if (!state.lyrics) {
            setPage('lyrics');
        }
    }, [state.lyrics, setPage]);

    // Core function to generate a single image and its prompt.
    const generateOneImage = async (): Promise<{ prompt: string, url: string }> => {
        if (!apiKey) {
            throw new Error('API Key is not set.');
        }
        
        log({
            level: LogLevel.INFO,
            source: 'App',
            header: 'Generating new image prompt',
            details: { topic: state.topic, style: state.style, singers: state.singers }
        });
        const imagePrompt = await generateImagePrompt(apiKey, {
            topic: state.topic,
            style: state.style,
            singers: state.singers,
        }, log);

        log({
            level: LogLevel.INFO,
            source: 'App',
            header: 'Generating image with Imagen',
            details: { prompt: imagePrompt }
        });
        const imageUrl = await generateImage(apiKey, imagePrompt, log);
        
        return { prompt: imagePrompt, url: imageUrl };
    };
    
    const handleGenerate = async (count: number = 1) => {
        if (!apiKey) {
            setError('Please set your API Key in the settings before generating content.');
            return;
        }

        setIsLoading(true, count > 1 ? `Generating ${count} image concepts...` : 'Generating new cover art...');
        setError('');
        setImageGenerationSkipped(false); // User is actively generating, so un-skip.

        try {
            if (count > 1) {
                // Parallel generation for initial load
                const promises = Array.from({ length: count }, () => generateOneImage());
                const results = await Promise.all(promises);

                const newPrompts = [...state.coverImagePrompts, ...results.map(r => r.prompt)];
                const newUrls = [...state.coverImageUrls, ...results.map(r => r.url)];
                
                // Update context state in one go
                setCoverImagePrompts(newPrompts);
                setCoverImageUrls(newUrls);
                setSelectedCoverImageIndex(newUrls.length - 1); // Select the last generated image
            } else {
                // Single generation for the button click
                const { prompt, url } = await generateOneImage();
                addCoverImagePrompt(prompt);
                addCoverImageUrl(url); // This will select the new image automatically
            }
            playBeep();
        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred.';
            if (errorMessage.toLowerCase().includes('quota exceeded')) {
                setError('You have reached your daily image generation quota. You can continue to the Collection page without a cover image.');
                setImageGenerationSkipped(true);
            } else {
                setError(`Failed to generate cover art: ${errorMessage}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Auto-generate two images in parallel if no images exist and not skipped, and we have lyrics to work with
        if (state.lyrics && state.coverImageUrls.length === 0 && !isLoading && apiKey && !state.imageGenerationSkipped) {
            handleGenerate(2);
        }
    }, [state.lyrics, state.coverImageUrls.length, isLoading, apiKey, state.imageGenerationSkipped]);
    
    const getFilename = (index: number) => {
        return `${(state.title || `song-cover-${index + 1}`).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    }
    
    const handleSkip = () => {
        setImageGenerationSkipped(true);
    };

    const selectedPrompt = state.selectedCoverImageIndex !== null ? state.coverImagePrompts[state.selectedCoverImageIndex] : '';

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-4">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Album Art</h1>
                <p className="mt-2 text-[var(--text-muted)]">A picture is worth a thousand words. Generate multiple covers and select your favorite, or skip this step.</p>

                <div className="mt-6 flex flex-col items-center">
                    
                    {!isLoading && (
                        <div className="mb-6 flex justify-center items-center gap-4">
                            <button
                                onClick={() => handleGenerate(1)}
                                disabled={isLoading || !apiKey}
                                className="px-6 py-2 bg-[var(--color-fuchsia)] text-white font-semibold rounded-md hover:opacity-80 disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed transition-all"
                            >
                                Generate New Cover Art
                            </button>
                             <button
                                onClick={() => setIsPromptModalOpen(true)}
                                disabled={state.selectedCoverImageIndex === null}
                                className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold rounded-md hover:opacity-80 disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed transition-opacity"
                            >
                                View Prompt
                            </button>
                            <button
                                onClick={handleSkip}
                                disabled={isLoading}
                                className="px-4 py-2 text-[var(--text-muted)] underline hover:text-[var(--text-primary)] transition-colors"
                            >
                                Skip for Now
                            </button>
                        </div>
                    )}

                    {error && <p className="my-4 text-[var(--color-red)] bg-[var(--color-red)]/10 p-3 rounded-md w-full max-w-2xl">{error}</p>}

                    {state.coverImageUrls.length > 0 && !isLoading && (
                         <div className="w-full">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {state.coverImageUrls.map((url, index) => (
                                    <div key={index} className="relative group" onClick={() => setSelectedCoverImageIndex(index)}>
                                        <img 
                                            src={url} 
                                            alt={`Generated album cover ${index + 1}`} 
                                            className={`rounded-lg shadow-lg w-full cursor-pointer transition-all duration-300 ${state.selectedCoverImageIndex === index ? 'ring-4 ring-offset-2 ring-offset-[var(--bg-inset)] ring-[var(--accent-primary)]' : 'ring-2 ring-transparent'}`} 
                                            style={{aspectRatio: '3 / 4'}} 
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-start justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                                            <a
                                                href={url}
                                                download={getFilename(index)}
                                                className="p-2 bg-black/60 text-white rounded-full hover:bg-[var(--color-green)] transition-colors"
                                                title="Download Image"
                                                onClick={(e) => e.stopPropagation()} // Prevent selection when downloading
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-shrink-0">
                <NavigationButtons
                    onPrev={() => setPage('karaoke')}
                />
            </div>

            <Modal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} title="Image Generation Prompt">
                <div className="flex flex-col h-full">
                    <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                        <p className="text-[var(--text-secondary)]">The following prompt was used to generate the selected image:</p>
                        <pre className="p-4 bg-[var(--bg-inset)] rounded-md whitespace-pre-wrap font-sans text-[var(--text-secondary)]">
                            {selectedPrompt || 'No prompt available. Select an image first.'}
                        </pre>
                    </div>
                     <div className="flex justify-end pt-4 flex-shrink-0">
                         <button
                            onClick={() => setIsPromptModalOpen(false)}
                            className="px-6 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-secondary)]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
