

import React, { useEffect, useState } from 'react';
import { Page } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { NavigationButtons } from '../components/common/NavigationButtons';
import { Tooltip } from '../components/common/Tooltip';

interface InstrumentsPageProps {
  setPage: (page: Page) => void;
}

export const InstrumentsPage: React.FC<InstrumentsPageProps> = ({ setPage }) => {
    const { state, setInstruments, styleData } = useGenerationContext();
    const [copied, setCopied] = useState(false);
    
    useEffect(() => {
        if (!state.style) {
            setPage('style');
            return;
        } 
        
        // This check ensures we only set defaults if instruments haven't been touched for this style yet
        if (state.instruments.length === 0) {
            const styleInfo = styleData[state.style];
            if (styleInfo) {
                const defaultInstruments = styleInfo.instruments
                    .filter(inst => inst.default)
                    .map(inst => inst.name);

                if (defaultInstruments.length > 0) {
                    setInstruments(defaultInstruments);
                }
            }
        }
    }, [state.style, setPage]);
    
    const availableInstruments = state.style ? styleData[state.style]?.instruments ?? [] : [];

    const handleCheckboxChange = (instrumentName: string, isChecked: boolean) => {
        const newInstruments = isChecked
            ? [...state.instruments, instrumentName]
            : state.instruments.filter(name => name !== instrumentName);
        setInstruments(newInstruments);
    };
    
    const handleCopy = () => {
        if(!state.style) return;
        const csvLine = [state.style, ...state.instruments].join(', ');
        navigator.clipboard.writeText(csvLine);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (!state.style) {
        return <div className="text-center p-8">Please select a style first. Redirecting...</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-4">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Build Your Band</h1>
                <p className="mt-2 text-[var(--text-muted)]">Select the instruments for your <span className="font-semibold text-[var(--accent-secondary)]">{state.style}</span> track. Hover over an instrument for a description.</p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    {availableInstruments.map(instrument => (
                        <Tooltip key={instrument.name} text={instrument.description}>
                            <label htmlFor={instrument.name} className="flex items-center p-2 rounded-md hover:bg-[var(--bg-tertiary)]/50 transition-colors cursor-pointer group">
                                <input
                                    id={instrument.name}
                                    type="checkbox"
                                    className="h-4 w-4 rounded bg-[var(--bg-tertiary)] border-[var(--border-secondary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] shrink-0"
                                    checked={state.instruments.includes(instrument.name)}
                                    onChange={(e) => handleCheckboxChange(instrument.name, e.target.checked)}
                                />
                                <span className="ml-3 text-[var(--text-secondary)]">{instrument.name}</span>
                            </label>
                        </Tooltip>
                    ))}
                </div>
                
                <div className="mt-8 flex justify-end">
                    <button onClick={handleCopy} className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md hover:opacity-80 transition-opacity text-sm">
                        {copied ? 'Copied!' : 'Copy Style & Instruments for Suno'}
                    </button>
                </div>
            </div>

            <div className="flex-shrink-0">
                <NavigationButtons
                    onPrev={() => setPage('style')}
                    onNext={() => setPage('lyrics')}
                    nextDisabled={state.instruments.length === 0}
                />
            </div>
        </div>
    );
};