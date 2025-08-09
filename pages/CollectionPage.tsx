import React, { useState } from 'react';
import { Page } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { NavigationButtons } from '../components/common/NavigationButtons';

interface CollectionPageProps {
  setPage: (page: Page) => void;
}

type CopiedState = 'title' | 'instruments' | 'lyrics' | 'image' | null;

const copyImageToClipboard = async (imageUrl: string) => {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
        return true;
    } catch (error) {
        console.error('Failed to copy image to clipboard:', error);
        return false;
    }
};

export const CollectionPage: React.FC<CollectionPageProps> = ({ setPage }) => {
    const { state } = useGenerationContext();
    const [copied, setCopied] = useState<CopiedState>(null);
    const [copyError, setCopyError] = useState('');

    const handleCopy = (type: CopiedState, content: string) => {
        setCopyError('');
        if (type === 'image') {
            if (!content) {
                setCopyError('No image to copy.');
                return;
            }
            copyImageToClipboard(content).then(success => {
                if (success) {
                    setCopied('image');
                    setTimeout(() => setCopied(null), 2000);
                } else {
                    setCopyError('Failed to copy image. Your browser may not support this feature.');
                }
            });
        } else {
            navigator.clipboard.writeText(content);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        }
    };

    const instrumentString = [state.style, ...state.instruments].join(', ');

    const CollectionItem: React.FC<{
        type: CopiedState,
        title: string,
        content: string,
        children: React.ReactNode,
    }> = ({ type, title, content, children }) => (
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
                <button
                    onClick={() => handleCopy(type, content)}
                    className="px-4 py-1 text-sm bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md hover:opacity-80 transition-opacity"
                >
                    {copied === type ? 'Copied!' : 'Copy'}
                </button>
            </div>
            {children}
        </div>
    );


    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-4">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Your Collection</h1>
                <p className="mt-2 text-[var(--text-muted)]">Everything you've created, ready to go. Use the copy buttons to easily transfer your content to Suno or anywhere else.</p>
                
                {copyError && <p className="mt-4 text-[var(--color-yellow)] bg-[var(--color-yellow)]/10 p-3 rounded-md">{copyError}</p>}

                <div className="mt-6 space-y-4">
                    <CollectionItem type="title" title="Title" content={state.title}>
                        <p className="text-[var(--accent-secondary)] font-semibold bg-[var(--bg-inset)] p-3 rounded-md">{state.title || 'No title generated.'}</p>
                    </CollectionItem>

                    <CollectionItem type="instruments" title="Style & Instruments" content={instrumentString}>
                        <p className="text-[var(--text-secondary)] bg-[var(--bg-inset)] p-3 rounded-md text-sm">{instrumentString || 'No style or instruments selected.'}</p>
                    </CollectionItem>

                    <CollectionItem type="lyrics" title="Lyrics" content={state.lyrics}>
                        <pre className="text-[var(--text-secondary)] bg-[var(--bg-inset)] p-3 rounded-md text-sm whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">{state.lyrics || 'No lyrics generated.'}</pre>
                    </CollectionItem>

                    <CollectionItem type="image" title="Cover Image" content={state.coverImageUrl}>
                        {state.coverImageUrl ? (
                            <img src={state.coverImageUrl} alt="Cover art thumbnail" className="w-32 h-auto rounded-md" style={{aspectRatio: '3/4'}}/>
                        ) : (
                            <p className="text-[var(--text-muted)]">No image generated.</p>
                        )}
                    </CollectionItem>
                </div>
            </div>

            <div className="flex-shrink-0">
                <NavigationButtons
                    onPrev={() => setPage('cover')}
                />
            </div>
        </div>
    );
};