

import React from 'react';
import { Page, MusicStyle } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { NavigationButtons } from '../components/common/NavigationButtons';

interface StylePageProps {
  setPage: (page: Page) => void;
}

export const StylePage: React.FC<StylePageProps> = ({ setPage }) => {
    const { state, setStyle, isStyleDataLoading, styleGroups, styleData } = useGenerationContext();

    const handleSelectStyle = (style: MusicStyle) => {
        setStyle(style);
    };

    const selectedStyleInfo = state.style ? styleData[state.style] : null;

    if (isStyleDataLoading) {
        return <div className="text-center text-[var(--text-muted)] p-8">Loading music styles...</div>
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Choose Your Vibe</h1>
                <p className="mt-2 text-[var(--text-muted)]">Select a musical style. This will help the AI choose the right instruments and craft lyrics with the appropriate tone.</p>
            </div>

            <div className="mt-6 flex-grow flex flex-col md:flex-row gap-8 overflow-hidden">
                {/* Left Column: Style Selection */}
                <div className="w-full md:w-2/3 space-y-6 overflow-y-auto pr-4 -mr-4">
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

                {/* Right Column: Description */}
                <div className="w-full md:w-1/3">
                    <div className="sticky top-0 p-6 bg-[var(--bg-secondary)] rounded-lg min-h-[200px] border border-[var(--border-primary)]">
                        {selectedStyleInfo ? (
                            <div className="animate-fade-in">
                                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{state.style}</h3>
                                <p className="text-[var(--text-secondary)]">{selectedStyleInfo.description}</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
                                <p>Select a style to see its description.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex-shrink-0">
                 <NavigationButtons
                    onPrev={() => setPage('topic')}
                    onNext={() => setPage('instruments')}
                    nextDisabled={!state.style}
                />
            </div>
        </div>
    );
};