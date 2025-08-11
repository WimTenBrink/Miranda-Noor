
import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { useGenerationContext } from '../context/GenerationContext';
import { LanguageGroup } from '../types';

interface LanguageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLanguage: (language: string) => void;
}

export const LanguageDialog: React.FC<LanguageDialogProps> = ({ isOpen, onClose, onSelectLanguage }) => {
    const { languageGroups, isLanguageDataLoading } = useGenerationContext();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSelectLanguage = (langName: string) => {
        onSelectLanguage(langName);
        onClose();
    };

    const filteredLanguageGroups = useMemo(() => {
        if (!searchTerm) {
            return languageGroups;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        
        const filteredGroups: LanguageGroup[] = [];

        languageGroups.forEach(group => {
            const filteredLanguages = group.languages.filter(lang =>
                lang.name.toLowerCase().includes(lowercasedFilter)
            );

            if (filteredLanguages.length > 0) {
                filteredGroups.push({ ...group, languages: filteredLanguages });
            }
        });
        
        return filteredGroups;
    }, [searchTerm, languageGroups]);

    const renderContent = () => {
        if (isLanguageDataLoading) {
            return <div className="p-8 text-center text-[var(--text-muted)]">Loading languages...</div>;
        }

        return (
            <div className="flex flex-col h-full">
                <div className="mb-4 flex-shrink-0">
                    <input
                        type="text"
                        placeholder="Search for a language..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                        aria-label="Search for a language"
                    />
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    {filteredLanguageGroups.length > 0 ? (
                        filteredLanguageGroups.map(group => (
                            <div key={group.groupName} className="mb-4">
                                <h3 className="text-lg font-semibold text-[var(--accent-secondary)] mb-2 sticky top-0 bg-[var(--bg-secondary)]/90 backdrop-blur-sm py-1">{group.groupName}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {group.languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleSelectLanguage(lang.name)}
                                            className="p-3 text-sm text-left rounded-md transition-colors bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--accent-primary)] hover:text-[var(--text-on-accent)]"
                                        >
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-[var(--text-muted)] py-10">No languages found.</div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select Song Language">
            {renderContent()}
        </Modal>
    );
};
