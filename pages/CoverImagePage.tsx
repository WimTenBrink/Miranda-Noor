import React, { useEffect, useState } from 'react';
import { Page } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { useSettings } from '../context/SettingsContext';
import { useLog } from '../hooks/useLog';
import { generateImagePrompt } from '../services/geminiService';
import { generateImage } from '../services/imagenService';
import { NavigationButtons } from '../components/common/NavigationButtons';

interface CoverImagePageProps {
  setPage: (page: Page) => void;
}

export const CoverImagePage: React.FC<CoverImagePageProps> = ({ setPage }) => {
    const { state, addCoverImagePrompt, addCoverImageUrl, setSelectedCoverImageIndex, isLoading, setIsLoading, setThinkingMessage } = useGenerationContext();
    const { apiKey } = useSettings();
    const log = useLog();
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!apiKey) {
            setError('Please set your API Key in the settings before generating content.');
            return;
        }

        setIsLoading(true, 'Starting cover art generation...');
        setError('');
        try {
            // Step 1: Generate a good prompt for Imagen
            setThinkingMessage('Generating image prompt...');
            const imagePrompt = await generateImagePrompt(apiKey, {
                topic: state.expandedTopic || state.topic,
                style: state.style
            }, log);
            addCoverImagePrompt(imagePrompt);

            // Step 2: Use that prompt to generate the image
            setThinkingMessage('Creating image with Imagen...');
            const imageUrl = await generateImage(apiKey, imagePrompt, log);
            addCoverImageUrl(imageUrl);

        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred.';
            setError(`Failed to generate cover art: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Auto-generate if no images exist
        if (state.coverImageUrls.length === 0 && !isLoading && apiKey) {
            handleGenerate();
        }
    }, [state.coverImageUrls, isLoading, apiKey]);
    
    const getFilename = (index: number) => {
        return `${(state.title || `song-cover-${index + 1}`).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    }

    const selectedPrompt = state.selectedCoverImageIndex !== null ? state.coverImagePrompts[state.selectedCoverImageIndex] : '';

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-4">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Album Art</h1>
                <p className="mt-2 text-[var(--text-muted)]">A picture is worth a thousand words. Generate multiple covers and select your favorite.</p>

                <div className="mt-6 flex flex-col items-center">
                    
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
                            {selectedPrompt && (
                                <p className="text-xs text-center text-[var(--text-muted)] mt-4 p-2 bg-[var(--bg-secondary)] rounded w-full max-w-2xl">Prompt: "{selectedPrompt}"</p>
                            )}
                        </div>
                    )}

                    {!isLoading && (
                        <div className="mt-8">
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !apiKey}
                                className="px-6 py-2 bg-[var(--color-fuchsia)] text-white font-semibold rounded-md hover:opacity-80 disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed transition-all"
                            >
                                Generate New Cover Art
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-shrink-0">
                <NavigationButtons
                    onPrev={() => setPage('lyrics')}
                    onNext={() => setPage('collection')}
                    nextDisabled={state.selectedCoverImageIndex === null}
                />
            </div>
        </div>
    );
};