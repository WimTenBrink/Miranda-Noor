

import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ConsoleDialog } from './components/ConsoleDialog';
import { TosDialog } from './components/TosDialog';
import { AboutDialog } from './components/AboutDialog';
import { ManualDialog } from './components/ManualDialog';
import { MusicStylesDialog } from './components/MusicStylesDialog';
import { ReportDialog } from './components/ReportDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { ApiKeyOverlay } from './components/ApiKeyOverlay';
import { useGenerationContext } from './context/GenerationContext';
import { useSettings } from './context/SettingsContext';
import { Page, GenerationState, MusicStyleDefinition } from './types';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { LoadingOverlay } from './components/common/LoadingOverlay';

import { TopicPage } from './pages/TopicPage';
import { StylePage } from './pages/StylePage';
import { InstrumentsPage } from './pages/InstrumentsPage';
import { LyricsPage } from './pages/LyricsPage';
import { CoverImagePage } from './pages/CoverImagePage';
import { CollectionPage } from './pages/CollectionPage';


type ModalType = 'console' | 'tos' | 'about' | 'manual' | 'musicStyles' | 'report' | 'settings' | null;
type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [currentPage, setCurrentPage] = useState<Page>('topic');
    const [theme, setTheme] = useState<Theme>('dark');
    const { state, isLoading, reset, styleData, isStyleDataLoading } = useGenerationContext();
    const { apiKey } = useSettings();

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const initialTheme = storedTheme || preferredTheme;
        setTheme(initialTheme);
        
        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);
    
    useEffect(() => {
        if (!apiKey && !isStyleDataLoading) {
            setActiveModal('settings');
        }
    }, [apiKey, isStyleDataLoading]);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            localStorage.setItem('theme', newTheme);
            return newTheme;
        });
    }, []);


    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'topic': return <TopicPage setPage={setCurrentPage} />;
            case 'style': return <StylePage setPage={setCurrentPage} />;
            case 'instruments': return <InstrumentsPage setPage={setCurrentPage} />;
            case 'lyrics': return <LyricsPage setPage={setCurrentPage} />;
            case 'cover': return <CoverImagePage setPage={setCurrentPage} />;
            case 'collection': return <CollectionPage setPage={setCurrentPage} />;
            default: return <TopicPage setPage={setCurrentPage} />;
        }
    };
    
    const handleReset = () => {
        if(window.confirm('Are you sure you want to start a new session? All current progress will be lost.')){
            reset();
            setCurrentPage('topic');
        }
    }

    const handleDownload = async () => {
        if (!state.title || !state.lyrics || state.coverImageUrls.length === 0 || state.selectedCoverImageIndex === null || !state.style) {
            console.error("Missing data for download.");
            alert("Cannot download collection, some assets are missing.");
            return;
        }

        const generateReportMarkdownForZip = (state: GenerationState, styleData: Record<string, MusicStyleDefinition>): string => {
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

        const markdownToHtmlForZip = (text: string): string => {
            let html = text
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                .replace(/^---$/gim, '<hr class="my-8 border-gray-300" />')
                .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; max-height: 80vh; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 1rem auto; display: block;" />')
                .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                .replace(/```([\s\S]*?)```/g, (match, content) => `<pre class="bg-gray-200 p-4 rounded-md whitespace-pre-wrap font-sans text-gray-700 overflow-x-auto">${content.trim()}</pre>`);

            html = html.replace(/^\s*[-*] (.*)/gm, '<li>$1</li>');
            html = html.replace(/(<li>[\s\S]*?<\/li>)/gs, '<ul>$1</ul>');
            html = html.replace(/<\/ul>\s*<ul>/g, '');
            
            html = html.split('\n\n').map(p => {
                const trimmed = p.trim();
                if (!trimmed) return '';
                if (trimmed.startsWith('<h') || trimmed.startsWith('<ul>') || trimmed.startsWith('<hr') || trimmed.startsWith('<img') || trimmed.startsWith('<pre')) {
                    return trimmed;
                }
                return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
            }).join('');

            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Song Report: ${state.title}</title>
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
</head>
<body class="bg-gray-50 text-gray-800">
    <main class="container mx-auto p-4 sm:p-8">
        <article class="prose lg:prose-xl">
            ${html}
        </article>
    </main>
</body>
</html>`;
        };
    
        const zip = new JSZip();
    
        zip.file("title.txt", state.title);
        zip.file("lyrics.txt", state.lyrics);
        const instrumentString = [state.style, ...state.instruments].join(', ');
        zip.file("style_and_instruments.txt", instrumentString);

        const markdownReport = generateReportMarkdownForZip(state, styleData);
        const htmlReport = markdownToHtmlForZip(markdownReport);
        zip.file("report.md", markdownReport);
        zip.file("report.html", htmlReport);
    
        try {
            const imagePromises = state.coverImageUrls.map(async (url, index) => {
                const response = await fetch(url);
                const imageBlob = await response.blob();
                zip.file(`cover-${index + 1}.png`, imageBlob);
            });
            await Promise.all(imagePromises);

            const content = await zip.generateAsync({ type: "blob" });
            const fileName = `${state.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'song_collection'}.zip`;
            saveAs(content, fileName);
    
        } catch (error) {
            console.error("Error creating zip file:", error);
            alert("An error occurred while creating the ZIP file. Please try again.");
        }
    };

    const isCollectionReady = !!state.title && !!state.lyrics && state.coverImageUrls.length > 0 && state.selectedCoverImageIndex !== null && state.instruments.length > 0;
    const showDownloadButton = currentPage === 'collection' && isCollectionReady;
    const showReportButton = currentPage === 'collection' && isCollectionReady;

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <Header
                onConsoleClick={() => setActiveModal('console')}
                onTosClick={() => setActiveModal('tos')}
                onAboutClick={() => setActiveModal('about')}
                onManualClick={() => setActiveModal('manual')}
                onMusicStylesClick={() => setActiveModal('musicStyles')}
                onReportClick={() => setActiveModal('report')}
                onSettingsClick={() => setActiveModal('settings')}
                onResetClick={handleReset}
                showDownloadButton={showDownloadButton}
                onDownloadClick={handleDownload}
                showReportButton={showReportButton}
                theme={theme}
                onThemeToggle={toggleTheme}
            />
            
            <div className="flex-grow flex overflow-hidden">
                <LeftSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
                
                <main className="flex-grow w-[50vw] relative bg-[var(--bg-inset)] flex flex-col overflow-hidden">
                   {!apiKey && !isStyleDataLoading ? (
                        <div className="h-full flex items-center justify-center p-8">
                            <ApiKeyOverlay />
                        </div>
                    ) : (
                        <>
                            <div className="flex-grow overflow-y-auto">
                                <div className="relative h-full">
                                    <div className={`p-8 h-full`}>
                                        {renderCurrentPage()}
                                    </div>
                                </div>
                            </div>
                            {isLoading && (
                                <div className="absolute inset-0 bg-[var(--bg-primary)]/60 backdrop-blur-sm z-20 flex items-center justify-center p-8">
                                    <LoadingOverlay />
                                </div>
                            )}
                        </>
                   )}
                </main>

                <RightSidebar />
            </div>

            <Footer />

            <ConsoleDialog isOpen={activeModal === 'console'} onClose={() => setActiveModal(null)} />
            <TosDialog isOpen={activeModal === 'tos'} onClose={() => setActiveModal(null)} />
            <AboutDialog isOpen={activeModal === 'about'} onClose={() => setActiveModal(null)} />
            <ManualDialog isOpen={activeModal === 'manual'} onClose={() => setActiveModal(null)} />
            <MusicStylesDialog isOpen={activeModal === 'musicStyles'} onClose={() => setActiveModal(null)} />
            <ReportDialog isOpen={activeModal === 'report'} onClose={() => setActiveModal(null)} />
            <SettingsDialog isOpen={activeModal === 'settings'} onClose={() => setActiveModal(null)} />
        </div>
    );
};

export default App;