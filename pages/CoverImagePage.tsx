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
    const { state, setCoverImagePrompt, setCoverImageUrl, isLoading, setIsLoading, setThinkingMessage } = useGenerationContext();
    const { apiKey } = useSettings();
    const log = useLog();
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!apiKey) return;
        setIsLoading(true, 'Starting cover art generation...');
        setError('');
        try {
            // Step 1: Generate a good prompt for Imagen
            setThinkingMessage('Generating image prompt...');
            const imagePrompt = await generateImagePrompt(apiKey, {
                topic: state.expandedTopic || state.topic,
                style: state.style
            }, log);
            setCoverImagePrompt(imagePrompt);

            // Step 2: Use that prompt to generate the image
            setThinkingMessage('Creating image with Imagen...');
            const imageUrl = await generateImage(apiKey, imagePrompt, log);
            setCoverImageUrl(imageUrl);

        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred.';
            setError(`Failed to generate cover art: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Auto-generate if no image exists
        if (!state.coverImageUrl && apiKey && !isLoading) {
            handleGenerate();
        }
    }, [state.coverImageUrl, apiKey, isLoading]);
    
    const getFilename = () => {
        return `${(state.title || 'song-cover').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-4">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Album Art</h1>
                <p className="mt-2 text-[var(--text-muted)]">A picture is worth a thousand words. Here's a unique, AI-generated cover for your song.</p>

                <div className="mt-6 flex flex-col items-center">
                    
                    {error && <p className="my-4 text-[var(--color-red)] bg-[var(--color-red)]/10 p-3 rounded-md w-full max-w-md">{error}</p>}

                    {state.coverImageUrl && !isLoading ? (
                        <div className="w-full max-w-md">
                            <div className="relative group">
                                <img src={state.coverImageUrl} alt="Generated album cover" className="rounded-lg shadow-2xl w-full" style={{aspectRatio: '3 / 4'}} />
                                <div className="absolute inset-0 bg-black/40 flex justify-between items-start p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                                    <button
                                        onClick={handleGenerate}
                                        className="p-2 bg-black/60 text-white rounded-full hover:bg-[var(--color-fuchsia)] transition-colors"
                                        title="Redo Cover Art"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691V5.006h-4.992v.001M19.015 4.356v4.992m0 0h-4.992m4.992 0l-3.181-3.183a8.25 8.25 0 00-11.667 0L2.985 9.348z" />
                                        </svg>
                                    </button>
                                    <a
                                        href={state.coverImageUrl}
                                        download={getFilename()}
                                        className="p-2 bg-black/60 text-white rounded-full hover:bg-[var(--color-green)] transition-colors"
                                        title="Download Image"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-2 p-2 bg-[var(--bg-secondary)] rounded">Prompt: "{state.coverImagePrompt}"</p>
                        </div>
                    ) : (
                        !isLoading && (
                            <div className="flex flex-col items-center justify-center text-[var(--text-muted)] p-8">
                                <p className="mb-4">No cover art has been generated yet.</p>
                                <button
                                    onClick={handleGenerate}
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-[var(--color-fuchsia)] text-white font-semibold rounded-md hover:opacity-80 disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed transition-all"
                                >
                                    Generate Cover Art
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className="flex-shrink-0">
                <NavigationButtons
                    onPrev={() => setPage('lyrics')}
                    onNext={() => setPage('collection')}
                    nextDisabled={!state.coverImageUrl}
                />
            </div>
        </div>
    );
};