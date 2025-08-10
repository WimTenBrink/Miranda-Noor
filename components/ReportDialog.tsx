
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useGenerationContext } from '../context/GenerationContext';
import { GenerationState, MusicStyleDefinition } from '../types';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const generateReportMarkdown = (state: GenerationState, styleData: Record<string, MusicStyleDefinition>): string => {
    if (!state.title) {
        return "# Report\n\nNo content generated yet.";
    }

    const styleInfo = state.style ? styleData[state.style] : null;

    const instrumentDescriptions = state.instruments.map(instName => {
        const instrument = styleInfo?.instruments.find(i => i.name === instName);
        return `- **${instName}:** ${instrument?.description || 'No description available.'}`;
    }).join('\n');
    
    const coverImagesMarkdown = state.coverImageUrls.map((_, index) => 
        `![Cover Art ${index + 1}](cover-${index + 1}.png)`
    ).join('\n\n');

    return `
# ${state.title}

## Style & Instruments

**Style:** ${state.style || 'N/A'}

### Instruments
${instrumentDescriptions || 'No instruments selected.'}

---

## Lyrics

\`\`\`
${state.lyrics || 'No lyrics generated.'}
\`\`\`

---

## Cover Art

${coverImagesMarkdown}
    `.trim().replace(/^\s+/gm, '');
};

const markdownToHtml = (text: string, imageUrls: string[]): string => {
    let html = text
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/^---$/gim, '<hr class="my-8 border-[var(--border-primary)]" />')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/```([\s\S]*?)```/g, (match, content) => `<pre class="bg-[var(--bg-inset)] p-4 rounded-md whitespace-pre-wrap font-sans text-[var(--text-secondary)] overflow-x-auto">${content.trim()}</pre>`);

    html = html.replace(/!\[(.*?)\]\(cover-(\d+)\.png\)/gim, (match, alt, indexStr) => {
        const index = parseInt(indexStr, 10) - 1;
        const imageUrl = imageUrls[index];
        if (imageUrl) {
             return `<img src="${imageUrl}" alt="${alt}" style="max-width: 100%; max-height: 60vh; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 1rem auto; display: block;" />`;
        }
        return '';
    });

    // Handle lists
    html = html.replace(/^\s*[-*] (.*)/gm, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    
    // Handle paragraphs
    html = html.split('\n\n').map(p => {
        const trimmed = p.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul>') || trimmed.startsWith('<hr') || trimmed.startsWith('<img') || trimmed.startsWith('<pre')) {
            return trimmed;
        }
        return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    }).join('');

    return html;
};

export const ReportDialog: React.FC<ReportDialogProps> = ({ isOpen, onClose }) => {
    const { state, styleData } = useGenerationContext();
    const [htmlContent, setHtmlContent] = useState('');

    useEffect(() => {
        if (isOpen && state.title && styleData) {
            const markdown = generateReportMarkdown(state, styleData);
            const html = markdownToHtml(markdown, state.coverImageUrls);
            setHtmlContent(html);
        }
    }, [isOpen, state, styleData]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Song Collection Report">
            <div 
                className="prose max-w-none text-[var(--text-secondary)] h-full overflow-y-auto pr-4"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
        </Modal>
    );
};