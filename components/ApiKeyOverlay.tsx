import React from 'react';

export const ApiKeyOverlay: React.FC = () => {
    return (
        <div className="text-center bg-[var(--bg-secondary)] p-8 rounded-lg shadow-lg border border-[var(--border-primary)]">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">API Key Required</h2>
            <p className="mt-2 text-[var(--text-secondary)]">
                Please set your Google AI API Key in the Settings menu to enable content generation.
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
                Click the gear icon in the top-right corner.
            </p>
        </div>
    );
};