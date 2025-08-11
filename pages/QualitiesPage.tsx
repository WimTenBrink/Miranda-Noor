

import React, { useState } from 'react';
import { Page } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { useSettings } from '../context/SettingsContext';
import { useLog } from '../hooks/useLog';
import { suggestStyle, expandTopic } from '../services/geminiService';
import { LogLevel } from '../types';
import { NavigationButtons } from '../components/common/NavigationButtons';
import { Tooltip } from '../components/common/Tooltip';

interface QualitiesPageProps {
  setPage: (page: Page) => void;
}

const DropdownSelector: React.FC<{
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
}> = ({ label, options, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{label}</label>
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value || null)}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-md text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
        >
            <option value="">Select...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


export const QualitiesPage: React.FC<QualitiesPageProps> = ({ setPage }) => {
    const { state, setStyle, setMood, setGenre, setPace, setInstrumentation, setExpandedTopic, isLoading, setIsLoading, styleData, qualityGroups, isQualitiesDataLoading } = useGenerationContext();
    const { apiKey } = useSettings();
    const log = useLog();
    const [error, setError] = useState('');

    const qualitySetters = {
        mood: setMood,
        genre: setGenre,
        pace: setPace,
        instrumentation: setInstrumentation,
    };
    
    const handleExpand = async () => {
        if (!apiKey) {
            setError('Please set your API Key in the settings before generating content.');
            return;
        }
        if (!state.topic) {
            setError('Please go back and enter a topic first.');
            return;
        }

        setIsLoading(true, 'Expanding with AI...');
        setError('');
        try {
            const expanded = await expandTopic(apiKey, state.topic, state.singers, {
                 mood: state.mood, 
                 genre: state.genre, 
                 pace: state.pace, 
                 instrumentation: state.instrumentation 
            }, log);
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
        if (!state.topic || !apiKey) {
            setPage('style');
            return;
        }

        setIsLoading(true, 'Analyzing topic for style...');
        
        const allStyles = Object.keys(styleData);
        if (allStyles.length > 0) {
            try {
                const suggested = await suggestStyle(apiKey, state.expandedTopic || state.topic, allStyles, {
                     mood: state.mood, 
                     genre: state.genre, 
                     pace: state.pace, 
                     instrumentation: state.instrumentation 
                }, log);
                if (suggested) {
                    setStyle(suggested);
                    log({ level: LogLevel.INFO, source: 'App', header: 'AI suggested style', details: { style: suggested } });
                }
            } catch (err: any) {
                 const errorMessage = err.message || 'An unknown error occurred.';
                 log({ level: LogLevel.ERROR, source: 'App', header: 'Style suggestion failed', details: { error: errorMessage } });
            }
        }
        
        setIsLoading(false);
        setPage('style');
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-4 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Fine-Tune the Feeling</h1>
                    <p className="mt-2 text-[var(--text-muted)]">Select any optional qualities to guide the AI. These will influence the topic expansion, lyrical tone, and musical style suggestion.</p>
                </div>

                 <div className="p-4 bg-[var(--bg-secondary)] rounded-md border border-[var(--border-primary)]">
                    {isQualitiesDataLoading ? (
                        <div className="text-center text-[var(--text-muted)] p-8">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {qualityGroups.map(group => (
                                <Tooltip key={group.key} text={group.description}>
                                    <DropdownSelector
                                        label={group.groupName}
                                        options={group.qualities}
                                        value={state[group.key]}
                                        onChange={qualitySetters[group.key]}
                                    />
                                </Tooltip>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        onClick={handleExpand}
                        disabled={isLoading || !state.topic || !apiKey}
                        className="px-4 py-2 bg-[var(--accent-primary)]/80 text-[var(--accent-subtle-text)] font-semibold rounded-md hover:bg-[var(--accent-primary)] disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Expanding...' : 'Expand Topic with Qualities'}
                    </button>
                    <p className="text-sm text-[var(--text-muted)]">Let AI enrich your initial topic using the qualities you've selected.</p>
                </div>
                
                {error && <p className="text-[var(--color-red)]">{error}</p>}
                
                {state.expandedTopic && (
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-4">Expanded Story</h3>
                        <textarea
                            readOnly
                            value={state.expandedTopic}
                            rows={8}
                            className="mt-2 w-full p-4 bg-[var(--bg-secondary)] rounded-md whitespace-pre-wrap font-sans text-[var(--text-secondary)] border border-transparent"
                        />
                    </div>
                )}
            </div>

            <div className="flex-shrink-0">
                <NavigationButtons
                    onPrev={() => setPage('language')}
                    onNext={handleNext}
                    nextDisabled={isLoading}
                />
            </div>
        </div>
    );
};