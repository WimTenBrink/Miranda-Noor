

import React from 'react';
import { Page } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { useSettings } from '../context/SettingsContext';
import { useLog } from '../hooks/useLog';
import { suggestStyle } from '../services/geminiService';
import { LogLevel } from '../types';
import { NavigationButtons } from '../components/common/NavigationButtons';
import { Tooltip } from '../components/common/Tooltip';

interface QualitiesPageProps {
  setPage: (page: Page) => void;
}

export const QualitiesPage: React.FC<QualitiesPageProps> = ({ setPage }) => {
    const { state, setStyle, setMood, setGenre, setPace, setInstrumentation, setVocalStyle, setLyricalTheme, setDrumStyle, setSnareType, setSpecialInstrument, setNarrativeDynamic, isLoading, setIsLoading, styleData, qualityGroups, isQualitiesDataLoading } = useGenerationContext();
    const { apiKey } = useSettings();
    const log = useLog();

    const qualitySetters: { [key: string]: (value: string | null) => void } = {
        mood: setMood,
        genre: setGenre,
        pace: setPace,
        instrumentation: setInstrumentation,
        vocalStyle: setVocalStyle,
        lyricalTheme: setLyricalTheme,
        drumStyle: setDrumStyle,
        snareType: setSnareType,
        specialInstrument: setSpecialInstrument,
        narrativeDynamic: setNarrativeDynamic,
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
                     language: state.language,
                     language2: state.language2,
                     mood: state.mood, 
                     genre: state.genre, 
                     pace: state.pace, 
                     instrumentation: state.instrumentation,
                     vocalStyle: state.vocalStyle,
                     lyricalTheme: state.lyricalTheme,
                     drumStyle: state.drumStyle,
                     snareType: state.snareType,
                     specialInstrument: state.specialInstrument,
                     narrativeDynamic: state.narrativeDynamic,
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
                    <p className="mt-2 text-[var(--text-muted)]">Select any optional qualities to guide the AI. These will influence the lyrical tone and musical style suggestion. Hover over an option to see its description.</p>
                </div>

                 <div className="space-y-8">
                    {isQualitiesDataLoading ? (
                        <div className="text-center text-[var(--text-muted)] p-8">Loading qualities...</div>
                    ) : (
                        qualityGroups.map(group => {
                            const setter = qualitySetters[group.key];
                            return (
                                <div key={group.key}>
                                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">{group.groupName}</h2>
                                    <p className="text-sm text-[var(--text-muted)] mb-3">{group.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {group.qualities.map(quality => {
                                            const isSelected = state[group.key] === quality.name;
                                            return (
                                                <Tooltip key={quality.name} text={quality.description}>
                                                    <button
                                                        onClick={() => {
                                                            if (setter) {
                                                                setter(isSelected ? null : quality.name);
                                                            }
                                                        }}
                                                        className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-inset)] ${
                                                            isSelected
                                                                ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold shadow-lg ring-2 ring-[var(--accent-secondary)]'
                                                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-secondary)]'
                                                        }`}
                                                    >
                                                        {quality.name}
                                                    </button>
                                                </Tooltip>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
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
