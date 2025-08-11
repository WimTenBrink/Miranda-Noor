





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
import { Page, GenerationState, MusicStyleDefinition, LogLevel } from './types';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { LoadingOverlay } from './components/common/LoadingOverlay';

import { TopicPage } from './pages/TopicPage';
import { LanguagePage } from './pages/LanguagePage';
import { QualitiesPage } from './pages/QualitiesPage';
import { StylePage } from './pages/StylePage';
import { InstrumentsPage } from './pages/InstrumentsPage';
import { LyricsPage } from './pages/LyricsPage';
import { CoverImagePage } from './pages/CoverImagePage';
import { CollectionPage } from './pages/CollectionPage';
import { KaraokePage } from './pages/KaraokePage';

import { useLog } from './hooks/useLog';
import { generateReportIntroduction } from './services/geminiService';


type ModalType = 'console' | 'tos' | 'about' | 'manual' | 'musicStyles' | 'report' | 'settings' | null;
type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [currentPage, setCurrentPage] = useState<Page>('topic');
    const [theme, setTheme] = useState<Theme>('dark');
    const { state, isLoading, setIsLoading, reset, styleData, isStyleDataLoading } = useGenerationContext();
    const { apiKey } = useSettings();
    const log = useLog();

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
            case 'language': return <LanguagePage setPage={setCurrentPage} />;
            case 'qualities': return <QualitiesPage setPage={setCurrentPage} />;
            case 'style': return <StylePage setPage={setCurrentPage} />;
            case 'instruments': return <InstrumentsPage setPage={setCurrentPage} />;
            case 'lyrics': return <LyricsPage setPage={setCurrentPage} />;
            case 'cover': return <CoverImagePage setPage={setCurrentPage} />;
            case 'collection': return <CollectionPage setPage={setCurrentPage} />;
            case 'karaoke': return <KaraokePage setPage={setCurrentPage} />;
            default: return <TopicPage setPage={setCurrentPage} />;
        }
    };
    
    const handleReset = () => {
        if(window.confirm('Are you sure you want to start a new session? All current progress will be lost.')){
            reset();
            setCurrentPage('topic');
        }
    }

    const coreContentReady = !!state.title && !!state.lyrics && state.instruments.length > 0;
    const imagesReady = state.coverImageUrls.length > 0 && state.selectedCoverImageIndex !== null;
    const isCollectionReady = coreContentReady && (imagesReady || state.imageGenerationSkipped);

    const handleDownload = async () => {
        if (!isCollectionReady) {
            console.error("Missing data for download.");
            alert("Cannot download collection, some assets are missing.");
            return;
        }

        setIsLoading(true, 'Preparing your download...');

        try {
            const [introduction, aboutText] = await Promise.all([
                 apiKey ? generateReportIntroduction(apiKey, {
                        title: state.title,
                        expandedTopic: state.expandedTopic || state.topic,
                        lyrics: state.lyrics,
                        singers: state.singers
                    }, log).catch(introError => {
                        log({ level: LogLevel.WARN, source: 'App', header: 'Failed to generate introduction for ZIP', details: { error: introError.message } });
                        return "Introduction could not be generated due to an API error.";
                    }) : Promise.resolve("Introduction could not be generated as no API key is set."),
                 fetch('/Noor-Brink.md').then(res => res.ok ? res.text() : '').catch(() => '')
            ]);
            
            const currentYear = new Date().getFullYear();
            const processedAboutText = aboutText.replace(/{year}/g, currentYear.toString());

            const plainLyrics = state.lyrics
                .replace(/\[.*?\]/g, '')
                .replace(/\(.*?\)/g, '')
                .replace(/\*.*?\*/g, '')
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join('\n');

            const generateReportMarkdownForZip = (): string => {
                const styleInfo = state.style ? styleData[state.style] : null;
                const instrumentDescriptions = state.instruments.map(instName => {
                    const instrument = styleInfo?.instruments.find(i => i.name === instName);
                    return `- **${instName}:** ${instrument?.description || 'No description available.'}`;
                }).join('\n');
                
                return `
# Song Report: ${state.title}

## Chapter 1: The Story Behind the Song
${introduction}

---

## Chapter 2: Musical Blueprint
**Style:** ${state.style || 'N/A'}
### Instruments
${instrumentDescriptions || 'No instruments selected.'}

---

## Chapter 3: The Libretto
**Title:** ${state.title}
### Formatted Lyrics
\`\`\`
${state.lyrics || 'No lyrics generated.'}
\`\`\`

---

## Chapter 4: The Karaoke Session
### Karaoke Lyrics
${plainLyrics}

---

## Chapter 5: About the Artists
${processedAboutText}
                `.trim().replace(/^\s+/gm, '');
            };

            const markdownToHtmlForZip = (text: string): string => {
                 let html = text
                    .replace(/### Karaoke Lyrics\n([\s\S]*?)(\n---|\n##)/, (match, content, boundary) => {
                        const karaokeHtml = content.trim().replace(/\n/g, '<br />');
                        return `<h3>Karaoke Lyrics</h3><div style="font-size: 1.25rem; line-height: 1.75rem; white-space: pre-wrap; font-family: sans-serif; background-color: #f3f4f6; padding: 1rem; border-radius: 0.375rem; color: #374151;">${karaokeHtml}</div>${boundary}`;
                    })
                    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                    .replace(/^---$/gim, '<hr style="margin-top: 2rem; margin-bottom: 2rem; border-top: 1px solid #d1d5db;" />')
                    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                    .replace(/```([\s\S]*?)```/g, (match, content) => `<pre style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.375rem; white-space: pre-wrap; font-family: monospace; font-size: 0.875rem; color: #4b5563; overflow-x: auto;">${content.trim()}</pre>`);
                    
                html = html.replace(/^\s*[-*] (.*)/gm, '<li>$1</li>');
                html = html.replace(/(<li>[\s\S]*?<\/li>)/gs, '<ul>$1</ul>');
                html = html.replace(/<\/ul>\s*<ul>/g, '');
                
                html = html.split('\n\n').map(p => {
                    const trimmed = p.trim();
                    if (!trimmed) return '';
                    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul>') || trimmed.startsWith('<hr') || trimmed.startsWith('<div') || trimmed.startsWith('<pre')) {
                        return trimmed;
                    }
                    return `<p style="line-height: 1.6;">${trimmed.replace(/\n/g, '<br/>')}</p>`;
                }).join('');

                return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Song Report: ${state.title}</title>
    <style> body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; color: #1f2937; background-color: #f9fafb; } main { max-width: 800px; margin: auto; padding: 2rem; } h1, h2, h3 { color: #111827; } </style>
</head>
<body>
    <main>
        <article>
            ${html}
        </article>
    </main>
</body>
</html>`;
            };
        
            const zip = new JSZip();
        
            zip.file("title.txt", state.title);
            zip.file("lyrics.txt", state.lyrics);
            zip.file("lyrics_plain.txt", plainLyrics);
            const instrumentString = [state.style, ...state.instruments].join(', ');
            zip.file("style_and_instruments.txt", instrumentString);

            const markdownReport = generateReportMarkdownForZip();
            const htmlReport = markdownToHtmlForZip(markdownReport);
            zip.file("report.md", markdownReport);
            zip.file("report.html", htmlReport);
        
            if (!state.imageGenerationSkipped && state.coverImageUrls.length > 0) {
                const imagePromises = state.coverImageUrls.map(async (url, index) => {
                    const response = await fetch(url);
                    const imageBlob = await response.blob();
                    zip.file(`cover-${index + 1}.png`, imageBlob);
                });
                await Promise.all(imagePromises);
            }

            const content = await zip.generateAsync({ type: "blob" });
            const fileName = `${state.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'song_collection'}.zip`;
            saveAs(content, fileName);
    
        } catch (error) {
            console.error("Error creating zip file:", error);
            alert("An error occurred while creating the ZIP file. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

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

                <RightSidebar currentPage={currentPage} />
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