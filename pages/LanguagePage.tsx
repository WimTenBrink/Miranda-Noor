

import React, { useState } from 'react';
import { Page } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { NavigationButtons } from '../components/common/NavigationButtons';
import { LanguageDialog } from '../components/LanguageDialog';
import { LanguageIcon } from '../components/icons/LanguageIcon';

interface LanguagePageProps {
  setPage: (page: Page) => void;
}

export const LanguagePage: React.FC<LanguagePageProps> = ({ setPage }) => {
    const { state, setLanguage, setLanguage2, isLoading } = useGenerationContext();
    const [isLang1ModalOpen, setIsLang1ModalOpen] = useState(false);
    const [isLang2ModalOpen, setIsLang2ModalOpen] = useState(false);

    const handleNext = () => {
        setPage('qualities');
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-4">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Choose Your Languages</h1>
                <p className="mt-2 text-[var(--text-muted)]">Select the primary language for your song. If you have more than one singer, you can choose a second language for a bilingual performance.</p>
                
                <div className="mt-6 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Primary Language</label>
                            <button
                                onClick={() => setIsLang1ModalOpen(true)}
                                className="w-full justify-center px-4 py-3 flex items-center gap-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-semibold rounded-md hover:bg-[var(--border-secondary)] transition-colors"
                            >
                                <LanguageIcon className="w-5 h-5" />
                                {state.language}
                            </button>
                        </div>
                        {state.singers.length > 1 && (
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Second Singer's Language</label>
                                <button
                                    onClick={() => setIsLang2ModalOpen(true)}
                                    className="w-full justify-center px-4 py-3 flex items-center gap-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-semibold rounded-md hover:bg-[var(--border-secondary)] transition-colors"
                                >
                                    <LanguageIcon className="w-5 h-5" />
                                    {state.language2}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0">
                <NavigationButtons
                    onPrev={() => setPage('topic')}
                    onNext={handleNext}
                    nextDisabled={isLoading}
                />
            </div>

            <LanguageDialog
                isOpen={isLang1ModalOpen}
                onClose={() => setIsLang1ModalOpen(false)}
                onSelectLanguage={setLanguage}
            />
            <LanguageDialog
                isOpen={isLang2ModalOpen}
                onClose={() => setIsLang2ModalOpen(false)}
                onSelectLanguage={setLanguage2}
            />
        </div>
    );
};