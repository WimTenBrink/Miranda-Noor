import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useLog } from '../hooks/useLog';
import { LogLevel } from '../types';

interface TosDialogProps {
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
        .replace(/\*(.*)\*/gim, '<em>$1</em>');
    
    // Wrap paragraphs
    html = html.split('\n\n').map(p => p.trim() ? `<p>${p.replace(/\n/g, '<br/>')}</p>` : '').join('');

    return html;
};

export const TosDialog: React.FC<TosDialogProps> = ({ isOpen, onClose }) => {
  const [htmlContent, setHtmlContent] = useState('<p>Loading...</p>');
  const log = useLog();

  useEffect(() => {
    if (isOpen) {
      fetch('/tos.md')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.text();
        })
        .then(text => {
            const today = new Date();
            const day = today.getDate();
            const month = today.toLocaleString('default', { month: 'long' });
            const year = today.getFullYear();

            const processedText = text
              .replace(/{day}/g, day.toString())
              .replace(/{month}/g, month)
              .replace(/{year}/g, year.toString());

            setHtmlContent(markdownToHtml(processedText));
        })
        .catch(error => {
            log({
                level: LogLevel.ERROR,
                source: 'App',
                header: 'Failed to fetch TOS markdown file',
                details: { error: error.message }
            });
            setHtmlContent('<h2>Error</h2><p>Failed to load Terms of Service. Please try again later.</p>');
        });
    }
  }, [isOpen, log]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Terms of Service">
      <div 
        className="prose prose-sm max-w-none text-[var(--text-secondary)] h-full overflow-y-auto pr-4"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </Modal>
  );
};
