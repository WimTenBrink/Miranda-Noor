

import React, { useState } from 'react';
import { Page } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { NavigationButtons } from '../components/common/NavigationButtons';

interface CollectionPageProps {
  setPage: (page: Page) => void;
}

type CopiedState = 'title' | 'instruments' | 'lyrics' | null;

export const CollectionPage: React.FC<CollectionPageProps> = ({ setPage }) => {
    const { state } = useGenerationContext();
    const [copied, setCopied] = useState<CopiedState>(null);

    const coreContentReady = !!state.title && !!state.lyrics && state.instruments.length > 0;

    const handleCopy = (type: CopiedState, content: string | null) => {
        if (!content) return;
        navigator.clipboard.writeText(content);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const instrumentString = (state.style || state.instruments.length > 0) ? [state.style, ...state.instruments].join(', ') : '';

    const CollectionItem: React.FC<{
        type: CopiedState,
        title: string,
        content: string | null,
        children: React.ReactNode,
    }> = ({ type, title, content, children }) => (
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
                <button
                    onClick={() => handleCopy(type, content)}
                    disabled={!content}
                    className="px-4 py-1 text-sm bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {copied === type ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <div className="flex-grow">{children}</div>
        </div>
    );


    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-4">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Your Collection</h1>
                <p className="mt-2 text-[var(--text-muted)]">Everything you've created, ready to go. Use the copy buttons to easily transfer your content to Suno or anywhere else.</p>
                
                <div className="mt-6 space-y-6">
                    <CollectionItem type="title" title="Title" content={state.title}>
                        <p className="text-[var(--accent-secondary)] font-semibold bg-[var(--bg-inset)] p-3 rounded-md">{state.title || 'No title generated.'}</p>
                    </CollectionItem>

                    <CollectionItem type="instruments" title="Style & Instruments" content={instrumentString}>
                        <p className="text-[var(--text-secondary)] bg-[var(--bg-inset)] p-3 rounded-md text-sm">{instrumentString || 'No style or instruments selected.'}</p>
                    </CollectionItem>

                    <CollectionItem type="lyrics" title="Lyrics" content={state.lyrics}>
                        <pre className="text-[var(--text-secondary)] bg-[var(--bg-inset)] p-3 rounded-md text-sm whitespace-pre-wrap font-sans max-h-96 overflow-y-auto">{state.lyrics || 'No lyrics generated.'}</pre>
                    </CollectionItem>
                </div>
            </div>

            <div className="flex-shrink-0">
                <NavigationButtons
                    onPrev={() => setPage('lyrics')}
                    onNext={() => setPage('karaoke')}
                    nextLabel="Karaoke"
                    nextDisabled={!coreContentReady}
                />
            </div>
        </div>
    );
};