import React, { useState } from 'react';
import { generateTitleAndLyrics } from '../services/geminiService';
import { useLog } from '../hooks/useLog';
import { LogLevel } from '../types';

export const LyricGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const log = useLog();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) {
            setError('Please enter a theme or topic for your lyrics.');
            return;
        }

        setError('');
        setLyrics('');
        setIsLoading(true);

        try {
            const result = await generateTitleAndLyrics({
                topic: prompt,
                style: 'Pop',
                instruments: ['Synthesizer', 'Drum Machine']
            }, log);
            setLyrics(`Title: ${result.title}\n\n${result.lyrics}`);
            log({ level: LogLevel.INFO, source: 'App', header: 'Lyrics generated successfully', details: { prompt } });
        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred.';
            setError(`Failed to generate lyrics: ${errorMessage}`);
            log({ level: LogLevel.ERROR, source: 'App', header: 'Lyric generation failed', details: { error: errorMessage } });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-slate-100">Generate Lyrics for Suno</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="lyric-prompt" className="block text-sm font-medium text-slate-300 mb-1">
                        What should the song be about?
                    </label>
                    <input
                        id="lyric-prompt"
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., a lonely robot finding a friend, a summer rainstorm"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Generating...' : 'Generate Lyrics'}
                </button>
            </form>
            {error && <p className="mt-4 text-red-400">{error}</p>}
            {lyrics && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-2 text-slate-200">Generated Lyrics:</h3>
                    <pre className="bg-slate-900 p-4 rounded-md whitespace-pre-wrap font-sans text-slate-300 overflow-x-auto">
                        {lyrics}
                    </pre>
                </div>
            )}
        </div>
    );
};