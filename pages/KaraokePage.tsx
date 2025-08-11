

import React, { useMemo } from 'react';
import { Page } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { NavigationButtons } from '../components/common/NavigationButtons';

interface KaraokePageProps {
  setPage: (page: Page) => void;
}

export const KaraokePage: React.FC<KaraokePageProps> = ({ setPage }) => {
    const { state } = useGenerationContext();

    const plainLyrics = useMemo(() => {
        if (!state.lyrics) return '';
        // Removes [Singer], [Verse], (oohs), *sound effect* etc. and cleans up empty lines
        return state.lyrics
            .replace(/\[.*?\]/g, '')
            .replace(/\(.*?\)/g, '')
            .replace(/\*.*?\*/g, '')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n\n'); // Add extra space between paragraphs for readability
    }, [state.lyrics]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow flex flex-col overflow-hidden">
                <div className='flex-shrink-0'>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Karaoke</h1>
                    {state.lyrics && (
                       <p className="mt-2 text-[var(--text-muted)]">Sing your heart out! Here are the plain lyrics for your new song, "{state.title || 'Untitled'}".</p>
                    )}
                </div>
                
                <div className="mt-6 flex-grow bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-primary)] overflow-y-auto">
                    <pre className="text-center whitespace-pre-wrap font-sans text-4xl leading-relaxed text-[var(--text-primary)]">
                        {plainLyrics}
                    </pre>
                </div>
            </div>

            <div className="flex-shrink-0">
                 <NavigationButtons
                    onPrev={() => setPage('collection')}
                    onNext={() => setPage('cover')}
                    nextLabel="Cover Image"
                />
            </div>
        </div>
    );
};