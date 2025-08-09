import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useLog } from '../hooks/useLog';
import { LogLevel } from '../types';

interface ManualDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// A very basic markdown to HTML converter to be used with Tailwind's typography plugin
const markdownToHtml = (text: string) => {
    let html = text
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Handle lists
    html = html.replace(/^\s*[-*] (.*)/gm, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    
    // Wrap paragraphs
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

export const ManualDialog: React.FC<ManualDialogProps> = ({ isOpen, onClose }) => {
  const [htmlContent, setHtmlContent] = useState('<p>Loading...</p>');
  const log = useLog();

  useEffect(() => {
    if (isOpen) {
      fetch('/manual.md')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.text();
        })
        .then(text => {
            setHtmlContent(markdownToHtml(text));
        })
        .catch(error => {
            log({
                level: LogLevel.ERROR,
                source: 'App',
                header: 'Failed to fetch manual markdown file',
                details: { error: error.message }
            });
            setHtmlContent('<h2>Error</h2><p>Failed to load User Manual. Please try again later.</p>');
        });
    }
  }, [isOpen, log]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Manual">
      <div 
        className="prose prose-sm max-w-none text-[var(--text-secondary)] h-full overflow-y-auto pr-4"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </Modal>
  );
};
