

import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { ConsoleIcon } from './icons/ConsoleIcon';
import { TosIcon } from './icons/TosIcon';
import { AboutIcon } from './icons/AboutIcon';
import { ResetIcon } from './icons/ResetIcon';
import { ManualIcon } from './icons/ManualIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { MusicIcon } from './icons/MusicIcon';
import { ReportIcon } from './icons/ReportIcon';

interface HeaderProps {
  onConsoleClick: () => void;
  onTosClick: () => void;
  onAboutClick: () => void;
  onManualClick: () => void;
  onMusicStylesClick: () => void;
  onResetClick: () => void;
  showDownloadButton: boolean;
  onDownloadClick: () => void;
  showReportButton: boolean;
  onReportClick: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    onConsoleClick, 
    onTosClick, 
    onAboutClick,
    onManualClick,
    onMusicStylesClick,
    onResetClick, 
    showDownloadButton, 
    onDownloadClick,
    showReportButton,
    onReportClick,
    theme,
    onThemeToggle
}) => {
  return (
    <header className="bg-[var(--bg-secondary)]/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-[var(--border-primary)]">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between" style={{ height: '50px' }}>
        <div className="flex items-center gap-3">
          <LogoIcon className="h-8 w-auto" />
          <span className="text-xl font-bold text-[var(--text-primary)] tracking-wider">Miranda Noor</span>
        </div>
        <nav className="flex items-center gap-2">
           {showReportButton && (
             <button onClick={onReportClick} className="px-3 py-1.5 text-sm rounded-md bg-[var(--accent-secondary)] text-white hover:opacity-90 transition-opacity font-semibold flex items-center gap-2" title="View Collection Report">
                <ReportIcon className="h-4 w-4" />
                View Report
             </button>
           )}
           {showDownloadButton && (
             <button onClick={onDownloadClick} className="px-3 py-1.5 text-sm rounded-md bg-[var(--color-green)] text-white hover:opacity-90 transition-opacity font-semibold flex items-center gap-2" title="Download Collection as ZIP">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download All
             </button>
           )}
           <button onClick={onResetClick} className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors" title="Start New Session">
            <ResetIcon className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          
          <button onClick={onThemeToggle} className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors" title="Toggle Theme">
            {theme === 'dark' ? <SunIcon className="w-5 h-5 text-[var(--text-muted)]" /> : <MoonIcon className="w-5 h-5 text-[var(--text-muted)]" />}
          </button>
          
          <div className="w-px h-6 bg-[var(--border-primary)] mx-2"></div>

          <button onClick={onConsoleClick} className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors" title="Console">
            <ConsoleIcon className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <button onClick={onManualClick} className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors" title="Manual">
            <ManualIcon className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <button onClick={onMusicStylesClick} className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors" title="Music Styles Explorer">
            <MusicIcon className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <button onClick={onTosClick} className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors" title="Terms of Service">
            <TosIcon className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <button onClick={onAboutClick} className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors" title="About">
            <AboutIcon className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </nav>
      </div>
    </header>
  );
};
