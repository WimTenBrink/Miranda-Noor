import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useLog } from '../hooks/useLog';
import { LogLevel } from '../types';
import { LogoIcon } from './icons/LogoIcon';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'group' | 'miranda' | 'annelies';

const calculateAge = (birthDateString: string): number => {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// A markdown to HTML converter that strips image tags and handles basic formatting.
const markdownToHtml = (text: string) => {
    // First, strip out any markdown image tags to prevent them from rendering as text.
    let html = text.replace(/!\[.*?\]\(.*?\)/g, '');

    html = html
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Handle lists by wrapping them in <ul> tags
    html = html.replace(/^\s*[-*] (.*)/gm, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Handle paragraphs, ensuring not to wrap list items or headers in <p> tags
    html = html.split('\n\n').map(p => {
        const trimmed = p.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul>')) {
            return trimmed;
        }
        return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    }).join('');

    return html;
};

const PersonImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
    <img
        alt={alt}
        src={src}
        className="float-right ml-6 mb-4 w-1/3 max-w-[200px] rounded-lg shadow-lg"
    />
);


export const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('group');
    const [content, setContent] = useState<Record<Tab, string>>({ group: '', miranda: '', annelies: '' });
    const [isLoading, setIsLoading] = useState(false);
    const log = useLog();

    useEffect(() => {
        if (isOpen && !content.group) { // Only fetch if content is not already loaded
            setIsLoading(true);
            const filesToFetch: Record<Tab, string> = {
                group: '/Noor-Brink.md',
                miranda: '/Miranda_Noor.md',
                annelies: '/Annelies_Brink.md',
            };

            const mirandaAge = calculateAge('2007-01-01');
            const anneliesAge = calculateAge('2007-03-20');
            const currentYear = new Date().getFullYear();

            Promise.all(
                Object.entries(filesToFetch).map(([key, path]) =>
                    fetch(path)
                        .then(res => {
                            if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
                            return res.text();
                        })
                        .then(text => {
                            let processedText = text;
                            if (key === 'miranda') {
                                processedText = processedText.replace(/{miranda-age}/g, mirandaAge.toString());
                            } else if (key === 'annelies') {
                                processedText = processedText.replace(/{annelies-age}/g, anneliesAge.toString());
                            } else if (key === 'group') {
                                processedText = processedText.replace(/{year}/g, currentYear.toString());
                            }
                            return [key, markdownToHtml(processedText)];
                        })
                )
            )
            .then(Object.fromEntries)
            .then(fetchedContent => {
                setContent(fetchedContent as Record<Tab, string>);
            })
            .catch(error => {
                log({ level: LogLevel.ERROR, source: 'App', header: 'Failed to fetch "About" content', details: { error: error.message } });
                const errorMessage = markdownToHtml('## Error\n\nCould not load content at this time. Please try again later.');
                setContent({ group: errorMessage, miranda: errorMessage, annelies: errorMessage });
            })
            .finally(() => {
                setIsLoading(false);
            });
        }
    }, [isOpen, content.group, log]);

    const TabButton: React.FC<{ tabId: Tab, children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tabId
                    ? 'border-[var(--accent-primary)] text-[var(--accent-secondary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-secondary)]'
            }`}
        >
            {children}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="About Us">
            <div className="flex flex-col h-full">
                <div className="border-b border-[var(--border-primary)] flex-shrink-0">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <TabButton tabId="group">The Creators</TabButton>
                        <TabButton tabId="miranda">Miranda Noor</TabButton>
                        <TabButton tabId="annelies">Annelies Brink</TabButton>
                    </nav>
                </div>
                <div className="py-6 overflow-y-auto flex-grow pr-4">
                    {isLoading ? (
                        <div className="text-center text-[var(--text-muted)]">Loading content...</div>
                    ) : (
                        <div className="flow-root">
                            {activeTab === 'group' && (
                                <div className="float-right ml-6 mb-4 p-4 bg-[var(--bg-primary)] rounded-lg w-1/3 max-w-[200px]">
                                    <LogoIcon className="w-full h-auto" />
                                </div>
                            )}
                             {activeTab === 'miranda' && (
                                <PersonImage src="https://mirandanoor.com/Miranda_Noor.jpg" alt="A photo of Miranda Noor" />
                            )}
                            {activeTab === 'annelies' && (
                                <PersonImage src="https://mirandanoor.com/Annelies_Brink.jpg" alt="A photo of Annelies Brink" />
                            )}
                            <div
                                className="prose prose-sm max-w-none text-[var(--text-secondary)]"
                                dangerouslySetInnerHTML={{ __html: content[activeTab] }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
