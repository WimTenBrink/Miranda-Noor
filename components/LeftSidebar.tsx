import React from 'react';
import { Page } from '../types';
import { useGenerationContext } from '../context/GenerationContext';

interface LeftSidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

interface NavItemProps {
  page: Page;
  title: string;
  isComplete: boolean;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ page, title, isComplete, isActive, onClick, disabled }) => {
    return (
        <li>
            <button 
                onClick={onClick}
                disabled={disabled}
                className={`w-full text-left px-4 py-3 flex items-center gap-4 rounded-md transition-colors ${
                    isActive 
                        ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)]' 
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-white/50' : (disabled ? 'border-[var(--border-secondary)]' : 'border-[var(--border-secondary)]')}`}>
                    {isComplete && !isActive && <div className="w-3 h-3 bg-[var(--color-green)] rounded-full" />}
                    {isActive && <div className="w-3 h-3 bg-white rounded-full" />}
                </div>
                <span className="font-medium">{title}</span>
            </button>
        </li>
    );
};

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ currentPage, setCurrentPage }) => {
    const { state } = useGenerationContext();

    const menuItems: { page: Page, title: string }[] = [
        { page: 'topic', title: '1. Topic' },
        { page: 'style', title: '2. Style' },
        { page: 'instruments', title: '3. Instruments' },
        { page: 'lyrics', title: '4. Lyrics' },
        { page: 'cover', title: '5. Cover Image' },
        { page: 'collection', title: '6. Collection' },
    ];
    
    const isCollectionReady = state.title.length > 0 && state.lyrics.length > 0 && state.coverImageUrl.length > 0 && state.instruments.length > 0;

    const completionStatus = {
        topic: state.topic.length > 0,
        style: state.style !== null,
        instruments: state.instruments.length > 0,
        lyrics: state.lyrics.length > 0,
        cover: state.coverImageUrl.length > 0,
        collection: isCollectionReady,
    };


    return (
        <aside className="w-[25vw] max-w-xs bg-[var(--bg-secondary)] p-4 flex-shrink-0 flex flex-col border-r border-[var(--border-primary)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 px-2">Creative Steps</h2>
            <nav>
                <ul className="space-y-2">
                    {menuItems.map(item => (
                        <NavItem
                            key={item.page}
                            page={item.page}
                            title={item.title}
                            isActive={currentPage === item.page}
                            isComplete={completionStatus[item.page]}
                            onClick={() => setCurrentPage(item.page)}
                            disabled={item.page === 'collection' && !isCollectionReady}
                        />
                    ))}
                </ul>
            </nav>
        </aside>
    );
};