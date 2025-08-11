

import React, { useState } from 'react';
import { Page, Singer, LogLevel, SongRating } from '../types';
import { useGenerationContext, ALL_SINGERS } from '../context/GenerationContext';
import { NavigationButtons } from '../components/common/NavigationButtons';
import { useSettings } from '../context/SettingsContext';
import { useLog } from '../hooks/useLog';
import { expandTopic } from '../services/geminiService';
import { playBeep } from '../utils/audio';

const RATINGS: SongRating[] = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

interface TopicPageProps {
  setPage: (page: Page) => void;
}

export const TopicPage: React.FC<TopicPageProps> = ({ setPage }) => {
    const { state, setTopic, setSingers, setRating, isLoading, setIsLoading } = useGenerationContext();
    const { apiKey } = useSettings();
    const log = useLog();
    const [error, setError] = useState('');

    const handleSingerChange = (singer: Singer, isChecked: boolean) => {
        let newSingers;
        if (isChecked) {
            newSingers = [...state.singers, singer];
        } else {
            newSingers = state.singers.filter(s => s.name !== singer.name);
        }
        setSingers(newSingers);
    };

    const handleExpand = async () => {
        if (!apiKey) {
            setError('Please set your API Key in the settings before generating content.');
            return;
        }
        if (!state.topic) {
            setError('Please enter a topic first.');
            return;
        }

        setIsLoading(true, 'Expanding with AI...');
        setError('');
        try {
            const expanded = await expandTopic(apiKey, state.topic, state.singers, state.rating, log);
            setTopic(expanded);
            playBeep();
        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred.';
            setError(`Failed to expand topic: ${errorMessage}`);
            log({ level: LogLevel.ERROR, source: 'App', header: 'Topic expansion failed', details: { error: errorMessage } });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-4">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">What's the story?</h1>
                <p className="mt-2 text-[var(--text-muted)]">Start with a few keywords, a sentence, or a full idea for your song. This will be the foundation for everything that follows.</p>
                
                <div className="mt-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                            Song Rating
                        </label>
                        <div className="flex flex-wrap gap-2 p-2 bg-[var(--bg-secondary)] rounded-md border border-[var(--border-primary)]">
                            {RATINGS.map(rating => (
                                <button
                                    key={rating}
                                    onClick={() => setRating(rating)}
                                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        state.rating === rating
                                            ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold shadow-md'
                                            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-secondary)]'
                                    }`}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                            Song Topic, Theme, or Story
                        </label>
                        <textarea
                            id="topic"
                            rows={8}
                            value={state.topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., a lonely robot finding a friend, a summer rainstorm in the city"
                            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-md text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                        />
                         <div className="flex items-center gap-4 mt-2">
                            <button
                                onClick={handleExpand}
                                disabled={isLoading || !state.topic || !apiKey}
                                className="px-4 py-2 bg-[var(--accent-primary)]/80 text-[var(--accent-subtle-text)] font-semibold rounded-md hover:bg-[var(--accent-primary)] disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Expanding...' : 'Expand Topic with AI'}
                            </button>
                            <p className="text-sm text-[var(--text-muted)]">Let AI enrich your topic. The result will replace the text above, allowing you to edit and expand again.</p>
                        </div>
                        {error && <p className="text-sm text-[var(--color-red)] mt-2">{error}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                            Singers
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 p-4 bg-[var(--bg-secondary)] rounded-md border border-[var(--border-primary)]">
                            {ALL_SINGERS.map(singer => {
                                const isChecked = state.singers.some(s => s.name === singer.name);
                                const isDisabled = isChecked && state.singers.length === 1;
                                return (
                                    <label key={singer.name} htmlFor={singer.name} className={`flex items-center p-2 rounded-md transition-colors ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[var(--bg-tertiary)]/50 cursor-pointer'}`}>
                                        <input
                                            id={singer.name}
                                            type="checkbox"
                                            className="h-4 w-4 rounded bg-[var(--bg-tertiary)] border-[var(--border-secondary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] shrink-0"
                                            checked={isChecked}
                                            disabled={isDisabled}
                                            onChange={(e) => handleSingerChange(singer, e.target.checked)}
                                        />
                                        <span className="ml-3 text-[var(--text-secondary)]">
                                            {singer.name} <span className="text-[var(--text-muted)] text-xs">({singer.voice})</span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0">
                <NavigationButtons
                    onNext={() => setPage('language')}
                    nextDisabled={!state.topic || isLoading}
                />
            </div>
        </div>
    );
};
