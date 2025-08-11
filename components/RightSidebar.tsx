

import React from 'react';
import { useGenerationContext } from '../context/GenerationContext';
import { Page, Quality } from '../types';

interface RightSidebarProps {
  currentPage: Page;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ currentPage }) => {
    const { state, styleData, qualityGroups } = useGenerationContext();
    const selectedImageUrl = state.selectedCoverImageIndex !== null ? state.coverImageUrls[state.selectedCoverImageIndex] : null;
    const selectedStyleInfo = state.style ? styleData[state.style] : null;

    const InfoBlock: React.FC<{title: string; children: React.ReactNode; condition?: boolean}> = ({ title, children, condition = true }) => {
        if (!condition) return null;
        return (
            <div>
                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">{title}</h3>
                <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-tertiary)]/50 p-3 rounded-md">{children}</div>
            </div>
        )
    }

    const allQualities = qualityGroups.flatMap(g =>
        g.qualities.map(q => ({ groupName: g.groupName, key: g.key, ...q }))
    );

    const selectedQualities = Object.entries(state)
        .map(([key, value]) => {
            if (!value) return undefined;
            return allQualities.find(q => q.key === key && q.name === value);
        })
        .filter((q): q is (typeof allQualities)[number] => q != null);


    return (
        <aside className="w-[25vw] max-w-xs bg-[var(--bg-secondary)] p-6 flex-shrink-0 border-l border-[var(--border-primary)] overflow-y-auto">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Current Song</h2>
            <div className="space-y-6">
                
                {currentPage === 'style' && (
                    <InfoBlock title="Style Description" condition={!!selectedStyleInfo}>
                        <>
                            <h3 className="text-lg font-semibold text-[var(--accent-secondary)] mb-2">{state.style}</h3>
                            <p>{selectedStyleInfo?.description}</p>
                        </>
                    </InfoBlock>
                )}

                <InfoBlock title="Topic" condition={!!state.topic}>
                    <p className="line-clamp-3">{state.topic}</p>
                </InfoBlock>

                <InfoBlock title="Singers" condition={state.singers.length > 0}>
                    <ul className="space-y-1">
                        {state.singers.map(s => <li key={s.name}>{s.name} <span className="text-xs text-[var(--text-muted)]">({s.voice})</span></li>)}
                    </ul>
                </InfoBlock>

                 <InfoBlock title="Languages" condition={!!state.language}>
                    <p>{state.language}{state.language.toLowerCase() !== state.language2.toLowerCase() ? ` & ${state.language2}` : ''}</p>
                </InfoBlock>

                <InfoBlock title="Qualities" condition={selectedQualities.length > 0}>
                     <ul className="space-y-3">
                        {selectedQualities.map(q => (
                            <li key={q.name}>
                                <div className="font-semibold text-[var(--text-primary)]">{q.groupName}: {q.name}</div>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5">{q.description}</p>
                            </li>
                        ))}
                    </ul>
                </InfoBlock>

                <InfoBlock title="Style" condition={!!state.style && currentPage !== 'style'}>
                    <p className="font-semibold">{state.style}</p>
                </InfoBlock>

                <InfoBlock title="Instruments" condition={state.instruments.length > 0}>
                    <ul className="flex flex-wrap gap-2">
                        {state.instruments.map(inst => (
                            <li key={inst} className="bg-[var(--bg-inset)] px-2 py-1 rounded text-xs">{inst}</li>
                        ))}
                    </ul>
                </InfoBlock>

                <InfoBlock title="Title" condition={!!state.title}>
                    <p className="font-semibold text-[var(--accent-secondary)]">{state.title}</p>
                </InfoBlock>

                <InfoBlock title="Cover Art" condition={!!selectedImageUrl || state.imageGenerationSkipped}>
                    {selectedImageUrl ? (
                       <img src={selectedImageUrl} alt="Generated cover art" className="rounded-md aspect-square object-cover" />
                    ) : (
                        <p className="text-center text-xs text-[var(--text-muted)] py-4">Image generation skipped.</p>
                    )}
                </InfoBlock>
            </div>
        </aside>
    );
};