import React from 'react';
import { useGenerationContext } from '../context/GenerationContext';

export const RightSidebar: React.FC = () => {
    const { state } = useGenerationContext();
    const selectedImageUrl = state.selectedCoverImageIndex !== null ? state.coverImageUrls[state.selectedCoverImageIndex] : null;


    const InfoBlock: React.FC<{title: string; children: React.ReactNode; condition?: boolean}> = ({ title, children, condition = true }) => {
        if (!condition) return null;
        return (
            <div>
                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">{title}</h3>
                <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-tertiary)]/50 p-3 rounded-md">{children}</div>
            </div>
        )
    }

    return (
        <aside className="w-[25vw] max-w-xs bg-[var(--bg-secondary)] p-6 flex-shrink-0 border-l border-[var(--border-primary)] overflow-y-auto">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Current Song</h2>
            <div className="space-y-6">
                <InfoBlock title="Topic" condition={!!state.topic}>
                    <p className="line-clamp-3">{state.topic}</p>
                </InfoBlock>

                <InfoBlock title="Style" condition={!!state.style}>
                    <p className="font-semibold">{state.style}</p>
                </InfoBlock>

                <InfoBlock title="Instruments" condition={state.instruments.length > 0}>
                    <ul className="flex flex-wrap gap-2">
                        {state.instruments.map(inst => (
                            <li key={inst} className="bg-[var(--bg-tertiary)] px-2 py-1 rounded text-xs">{inst}</li>
                        ))}
                    </ul>
                </InfoBlock>

                <InfoBlock title="Title" condition={!!state.title}>
                    <p className="font-semibold text-[var(--accent-secondary)]">{state.title}</p>
                </InfoBlock>

                <InfoBlock title="Cover Art" condition={!!selectedImageUrl}>
                    <img src={selectedImageUrl!} alt="Generated cover art" className="rounded-md aspect-square object-cover" />
                </InfoBlock>
            </div>
        </aside>
    );
};