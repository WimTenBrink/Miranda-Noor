import React from 'react';
import { useGenerationContext } from '../../context/GenerationContext';

export const LoadingOverlay: React.FC = () => {
    const { state } = useGenerationContext();

    return (
        <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-[var(--accent-primary)] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-4">{state.thinkingMessage}</h2>
            <p className="mt-2 text-[var(--text-secondary)]">
                Please wait while we generate your content.
            </p>
        </div>
    );
};