import React, { useState } from 'react';
import { Page } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { useLog } from '../hooks/useLog';
import { expandTopic, suggestStyle } from '../services/geminiService';
import { LogLevel } from '../types';
import { NavigationButtons } from '../components/common/NavigationButtons';

interface TopicPageProps {
  setPage: (page: Page) => void;
}

export const TopicPage: React.FC<TopicPageProps> = ({ setPage }) => {
    const { state, setTopic, setExpandedTopic, isLoading, setIsLoading, setStyle, styleData } = useGenerationContext();
    const log = useLog();
    const [error, setError] = useState('');

    const handleExpand = async () => {
        if (!state.topic) {
            setError('Please enter a topic before expanding.');
            return;
        }

        setIsLoading(true, 'Expanding with AI...');
        setError('');
        try {
            const expanded = await expandTopic(state.topic, log);
            setExpandedTopic(expanded);
        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred.';
            setError(`Failed to expand topic: ${errorMessage}`);
            log({ level: LogLevel.ERROR, source: 'App', header: 'Topic expansion failed', details: { error: errorMessage } });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = async () => {
        if (!state.topic) {
            setPage('style');
            return;
        }

        setIsLoading(true, 'Analyzing topic for style...');
        
        const allStyles = Object.keys(styleData);
        if (allStyles.length > 0) {
            const suggested = await suggestStyle(state.expandedTopic || state.topic, allStyles, log);
            if (suggested) {
                setStyle(suggested);
                log({ level: LogLevel.INFO, source: 'App', header: 'AI suggested style', details: { style: suggested } });
            }
        }
        
        setIsLoading(false);
        setPage('style');
    };
    
    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-4">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">What's the story?</h1>
                <p className="mt-2 text-[var(--text-muted)]">Start with a few keywords, a sentence, or a full idea for your song. This will be the foundation for everything that follows.</p>
                
                <div className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                            Song Topic or Keywords
                        </label>
                        <textarea
                            id="topic"
                            rows={3}
                            value={state.topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., a lonely robot finding a friend, a summer rainstorm in the city"
                            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-md text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                        />
                    </div>
                    <button
                        onClick={handleExpand}
                        disabled={isLoading || !state.topic}
                        className="px-4 py-2 bg-[var(--accent-primary)]/80 text-[var(--accent-subtle-text)] font-semibold rounded-md hover:bg-[var(--accent-primary)] disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Expanding with AI...' : 'Expand Topic'}
                    </button>

                    {error && <p className="text-[var(--color-red)]">{error}</p>}
                    
                    {state.expandedTopic && (
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-4">Expanded Story</h3>
                            <textarea
                                readOnly
                                value={state.expandedTopic}
                                className="mt-2 w-full h-64 p-4 bg-[var(--bg-secondary)] rounded-md whitespace-pre-wrap font-sans text-[var(--text-secondary)] border border-transparent focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-shrink-0">
                <NavigationButtons
                    onNext={handleNext}
                    nextDisabled={!state.topic || isLoading}
                />
            </div>
        </div>
    );
};
