import React from 'react';
import { Page } from '../types';

interface LeftSidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ currentPage, setCurrentPage }) => {
    const menuItems: { page: Page, title: string }[] = [
        { page: 'topic', title: '1. Topic' },
        { page: 'language', title: '2. Language' },
        { page: 'qualities', title: '3. Qualities' },
        { page: 'style', title: '4. Style' },
        { page: 'instruments', title: '5. Instruments' },
        { page: 'lyrics', title: '6. Lyrics' },
        { page: 'collection', title: '7. Collection' },
        { page: 'cover', title: '8. Cover Image' },
        { page: 'karaoke', title: '9. Karaoke' },
    ];

    return (
        <aside className="w-[25vw] max-w-xs bg-[var(--bg-secondary)] p-4 flex-shrink-0 flex flex-col border-r border-[var(--border-primary)]">
            <h2 id="creative-steps-heading" className="text-lg font-semibold text-[var(--text-primary)] mb-4 px-2">Creative Steps</h2>
            <nav aria-labelledby="creative-steps-heading">
                <ul className="space-y-2">
                    {menuItems.map(item => (
                        <li key={item.page}>
                            <button 
                                onClick={() => setCurrentPage(item.page)}
                                className={`w-full text-left px-4 py-3 rounded-md transition-colors font-medium ${
                                    currentPage === item.page 
                                        ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)]' 
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                }`}
                                aria-current={currentPage === item.page ? 'page' : undefined}
                            >
                                {item.title}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};