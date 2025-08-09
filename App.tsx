import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SettingsDialog } from './components/SettingsDialog';
import { ConsoleDialog } from './components/ConsoleDialog';
import { TosDialog } from './components/TosDialog';
import { AboutDialog } from './components/AboutDialog';
import { ManualDialog } from './components/ManualDialog';
import { MusicStylesDialog } from './components/MusicStylesDialog';
import { useSettings } from './context/SettingsContext';
import { useGenerationContext } from './context/GenerationContext';
import { Page } from './types';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { ApiKeyOverlay } from './components/ApiKeyOverlay';
import { LoadingOverlay } from './components/common/LoadingOverlay';

import { TopicPage } from './pages/TopicPage';
import { StylePage } from './pages/StylePage';
import { InstrumentsPage } from './pages/InstrumentsPage';
import { LyricsPage } from './pages/LyricsPage';
import { CoverImagePage } from './pages/CoverImagePage';
import { CollectionPage } from './pages/CollectionPage';


type ModalType = 'settings' | 'console' | 'tos' | 'about' | 'manual' | 'musicStyles' | null;
type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [currentPage, setCurrentPage] = useState<Page>('topic');
    const [theme, setTheme] = useState<Theme>('dark');
    const { apiKey } = useSettings();
    const { state, isLoading, reset } = useGenerationContext();

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
        if (!state.title || !state.lyrics || !state.coverImageUrl || !state.style) {
            console.error("Missing data for download.");
            alert("Cannot download collection, some assets are missing.");
            return;
        }
    
        const zip = new JSZip();
    
        zip.file("title.txt", state.title);
        zip.file("lyrics.txt", state.lyrics);
        const instrumentString = [state.style, ...state.instruments].join(', ');
        zip.file("style_and_instruments.txt", instrumentString);
    
        try {
            const response = await fetch(state.coverImageUrl);
            const imageBlob = await response.blob();
            zip.file("cover.png", imageBlob);
    
            const content = await zip.generateAsync({ type: "blob" });
            const fileName = `${state.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'song_collection'}.zip`;
            saveAs(content, fileName);
    
        } catch (error) {
            console.error("Error creating zip file:", error);
            alert("An error occurred while creating the ZIP file. Please try again.");
        }
    };

    const isCollectionReady = !!state.title && !!state.lyrics && !!state.coverImageUrl && state.instruments.length > 0;
    const showDownloadButton = currentPage === 'collection' && isCollectionReady;

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <Header
                onSettingsClick={() => setActiveModal('settings')}
                onConsoleClick={() => setActiveModal('console')}
                onTosClick={() => setActiveModal('tos')}
                onAboutClick={() => setActiveModal('about')}
                onManualClick={() => setActiveModal('manual')}
                onMusicStylesClick={() => setActiveModal('musicStyles')}
                onResetClick={handleReset}
                showDownloadButton={showDownloadButton}
                onDownloadClick={handleDownload}
                theme={theme}
                onThemeToggle={toggleTheme}
            />
            
            <div className="flex-grow flex overflow-hidden">
                <LeftSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
                
                <main className="flex-grow w-[50vw] relative bg-[var(--bg-inset)] flex flex-col overflow-hidden">
                    <div className="flex-grow overflow-y-auto">
                        <div className="relative h-full">
                             <div className={`p-8 h-full`}>
                                {renderCurrentPage()}
                            </div>
                        </div>
                    </div>
                     {isLoading || !apiKey ? (
                        <div className="absolute inset-0 bg-[var(--bg-primary)]/60 backdrop-blur-sm z-20 flex items-center justify-center p-8">
                            {!apiKey ? <ApiKeyOverlay /> : <LoadingOverlay />}
                        </div>
                    ) : null}
                </main>

                <RightSidebar />
            </div>

            <Footer />

            <SettingsDialog isOpen={activeModal === 'settings'} onClose={() => setActiveModal(null)} />
            <ConsoleDialog isOpen={activeModal === 'console'} onClose={() => setActiveModal(null)} />
            <TosDialog isOpen={activeModal === 'tos'} onClose={() => setActiveModal(null)} />
            <AboutDialog isOpen={activeModal === 'about'} onClose={() => setActiveModal(null)} />
            <ManualDialog isOpen={activeModal === 'manual'} onClose={() => setActiveModal(null)} />
            <MusicStylesDialog isOpen={activeModal === 'musicStyles'} onClose={() => setActiveModal(null)} />
        </div>
    );
};

export default App;