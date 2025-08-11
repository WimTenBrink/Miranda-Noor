





import React from 'react';
import { Page, MusicStyle } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { NavigationButtons } from '../components/common/NavigationButtons';

interface StylePageProps {
  setPage: (page: Page) => void;
}

export const StylePage: React.FC<StylePageProps> = ({ setPage }) => {
    const { state, setStyle, isStyleDataLoading, styleGroups } = useGenerationContext();

    const handleSelectStyle = (style: MusicStyle) => {
        setStyle(style);
    };

    if (isStyleDataLoading) {
        return <div className="text-center text-[var(--text-muted)] p-8">Loading music styles...</div>
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Choose Your Vibe</h1>
                <p className="mt-2 text-[var(--text-muted)]">Select a musical style. This will help the AI choose the right instruments and craft lyrics with the appropriate tone.</p>
            </div>

            <div className="mt-6 flex-grow overflow-hidden">
                <div className="space-y-6 overflow-y-auto h-full pr-4">
                    {styleGroups.map(group => (
                        <div key={group.name}>
                            <h2 className="text-xl font-semibold text-[var(--accent-secondary)] mb-3 sticky top-0 bg-[var(--bg-inset)]/80 backdrop-blur-sm py-2 z-10">{group.name}</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                {Object.keys(group.styles).map(styleKey => (
                                    <button
                                        key={styleKey}
                                        onClick={() => handleSelectStyle(styleKey)}
                                        className={`p-3 text-sm text-left rounded-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-inset)] ${
                                            state.style === styleKey
                                                ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold shadow-lg ring-2 ring-[var(--accent-secondary)]'
                                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-secondary)]'
                                        }`}
                                    >
                                        {styleKey}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex-shrink-0">
                 <NavigationButtons
                    onPrev={() => setPage('qualities')}
                    onNext={() => setPage('instruments')}
                    nextDisabled={!state.style}
                />
            </div>
        </div>
    );
};