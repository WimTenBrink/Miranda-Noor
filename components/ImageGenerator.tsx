import React, { useState } from 'react';
import { generateImage } from '../services/imagenService';
import { useLog } from '../hooks/useLog';
import { LogLevel } from '../types';

export const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const log = useLog();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) {
            setError('Please enter a description for your cover art.');
            return;
        }

        setError('');
        setImageUrl('');
        setIsLoading(true);

        try {
            const result = await generateImage(prompt, log);
            setImageUrl(result);
            log({ level: LogLevel.INFO, source: 'App', header: 'Image generated successfully', details: { prompt } });
        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred.';
            setError(`Failed to generate image: ${errorMessage}`);
            log({ level: LogLevel.ERROR, source: 'App', header: 'Image generation failed', details: { error: errorMessage } });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-slate-100">Create Cover Art</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="image-prompt" className="block text-sm font-medium text-slate-300 mb-1">
                        Describe the album cover
                    </label>
                    <input
                        id="image-prompt"
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., synthwave sunset over a chrome city, oil painting of a forest at night"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-fuchsia-600 text-white font-semibold rounded-md hover:bg-fuchsia-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Creating...' : 'Create Art'}
                </button>
            </form>
            {error && <p className="mt-4 text-red-400">{error}</p>}
            <div className="mt-6 flex justify-center items-center">
                {isLoading && (
                     <div className="w-64 h-64 bg-slate-700 rounded-md flex items-center justify-center">
                        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                     </div>
                )}
                {imageUrl && (
                    <img src={imageUrl} alt="Generated album cover" className="rounded-lg shadow-xl w-full max-w-md aspect-square" />
                )}
            </div>
        </div>
    );
};