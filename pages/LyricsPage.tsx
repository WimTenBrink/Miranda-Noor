

import React, { useEffect, useState } from 'react';
import { Page } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { useSettings } from '../context/SettingsContext';
import { useLog } from '../hooks/useLog';
import { generateTitleAndLyrics } from '../services/geminiService';
import { LogLevel } from '../types';
import { NavigationButtons } from '../components/common/NavigationButtons';

interface LyricsPageProps {
  setPage: (page: Page) => void;
}

const playSound = () => {
    // Use Web Audio API to play a sound without needing an audio file.
    // This avoids errors from trying to load a non-existent file.
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) {
        console.warn("Web Audio API is not supported in this browser.");
        return;
    }

    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        // A short, pleasant C5 note
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); 
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Start at a reasonable volume
        // Fade out quickly for a nice 'pop' sound
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2); // Play for 0.2 seconds
    } catch (e) {
        console.error("Error playing sound with Web Audio API:", e);
    }
};


export const LyricsPage: React.FC<LyricsPageProps> = ({ setPage }) => {
    const { state, setTitle, setLyrics, isLoading, setIsLoading } = useGenerationContext();
    const { apiKey } = useSettings();
    const log = useLog();
    const [error, setError] = useState('');
    const [titleCopied, setTitleCopied] = useState(false);
    const [lyricsCopied, setLyricsCopied] = useState(false);
    const [plainCopied, setPlainCopied] = useState(false);

    useEffect(() => {
        if (!state.topic) {
            setPage('topic');
        }
    }, [state.topic, setPage]);

    const performGeneration = async (mode: 'all' | 'title' | 'lyrics') => {
        if (!apiKey) {
            setError('Please set your API Key in the settings before generating content.');
            return;
        }
        if (!state.style || state.singers.length === 0) return;
        
        const message = {
            all: 'Crafting title and lyrics...',
            title: 'Rethinking the title...',
            lyrics: 'Rewriting the lyrics...'
        }[mode];
        
        setIsLoading(true, message);
        setError('');
        try {
            const { title, lyrics } = await generateTitleAndLyrics(apiKey, {
                topic: state.expandedTopic || state.topic,
                style: state.style,
                instruments: state.instruments,
                language: state.language,
                language2: state.language2,
                singers: state.singers,
                mood: state.mood,
                genre: state.genre,
                pace: state.pace,
                instrumentation: state.instrumentation,
                vocalStyle: state.vocalStyle,
                lyricalTheme: state.lyricalTheme,
            }, log);
            
            if (mode === 'all' || mode === 'title') {
                setTitle(title);
            }
            if (mode === 'all' || mode === 'lyrics') {
                setLyrics(lyrics);
            }
            log({ level: LogLevel.INFO, source: 'App', header: `Lyrics generation (${mode}) successful`, details: { title } });
            playSound();
        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred.';
            setError(`Failed to generate content: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        // Generate lyrics automatically if they don't exist when the page is visited
        if (state.topic && !state.lyrics && !isLoading && state.style && apiKey && state.singers.length > 0) {
            performGeneration('all');
        }
    }, [state.topic, state.lyrics, isLoading, state.style, apiKey, state.language, state.language2, state.singers, state.mood, state.genre, state.pace, state.instrumentation, state.vocalStyle, state.lyricalTheme]);

    const copyToClipboard = (text: string, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        navigator.clipboard.writeText(text);
        setter(true);
        setTimeout(() => setter(false), 2000);
    };

    const handleCopyPlain = () => {
        const plainLyrics = state.lyrics
            .replace(/\[.*?\]/g, '') // Remove all bracketed content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
        
        copyToClipboard(plainLyrics, setPlainCopied);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow flex flex-col overflow-y-auto pr-4 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">The Words</h1>
                    <p className="mt-2 text-[var(--text-muted)]">Here are the AI-generated title and lyrics. You can edit them directly, or use the "Redo" buttons to try again.</p>
                    {error && <p className="mt-4 text-[var(--color-red)] bg-[var(--color-red)]/10 p-3 rounded-md">{error}</p>}
                </div>
                
                {!isLoading && state.lyrics && (
                    <div className="space-y-6 flex-grow flex flex-col overflow-hidden">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <button onClick={() => performGeneration('title')} disabled={!apiKey} className="px-3 py-1 text-xs bg-[var(--accent-primary)] text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    Redo Title
                                </button>
                                <button onClick={() => copyToClipboard(state.title, setTitleCopied)} className="px-3 py-1 text-xs bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:opacity-80 rounded-md transition-opacity">
                                    {titleCopied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="text-2xl font-semibold text-[var(--accent-secondary)] p-3 bg-[var(--bg-secondary)] rounded-md">{state.title || "Untitled"}</div>
                        </div>

                        <div className="flex-grow flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center mb-2">
                                 <button onClick={() => performGeneration('lyrics')} disabled={!apiKey} className="px-3 py-1 text-xs bg-[var(--accent-primary)] text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    Redo Lyrics
                                </button>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleCopyPlain} className="px-3 py-1 text-xs bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:opacity-80 rounded-md transition-opacity">
                                        {plainCopied ? 'Copied!' : 'Copy Plain'}
                                    </button>
                                    <button onClick={() => copyToClipboard(state.lyrics, setLyricsCopied)} className="px-3 py-1 text-xs bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:opacity-80 rounded-md transition-opacity">
                                        {lyricsCopied ? 'Copied!' : 'Copy Formatted'}
                                    </button>
                                </div>
                            </div>
                            <textarea
                                value={state.lyrics}
                                onChange={(e) => setLyrics(e.target.value)}
                                className="w-full p-4 bg-[var(--bg-secondary)] rounded-md font-sans text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] border border-[var(--border-primary)] flex-grow min-h-[200px]"
                                placeholder="Lyrics will appear here..."
                            />
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex-shrink-0">
                <NavigationButtons
                    onPrev={() => setPage('instruments')}
                    onNext={() => setPage('collection')}
                    nextDisabled={!state.lyrics || isLoading}
                />
            </div>
        </div>
    );
};