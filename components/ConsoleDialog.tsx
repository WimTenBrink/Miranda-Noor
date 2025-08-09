import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { useLogContext } from '../context/LogContext';
import { LogEntry, LogLevel } from '../types';

interface ConsoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'all' | LogLevel;

const LogDetail: React.FC<{ entry: LogEntry }> = ({ entry }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR: return 'text-[var(--color-red)]';
      case LogLevel.WARN: return 'text-[var(--color-yellow)]';
      case LogLevel.GEMINI: return 'text-[var(--color-sky)]';
      case LogLevel.IMAGEN: return 'text-[var(--color-fuchsia)]';
      default: return 'text-[var(--text-muted)]';
    }
  };
  
  const fullLogMessage = `[${entry.timestamp}] [${entry.level}] ${entry.header}\n${JSON.stringify(entry.details, null, 2)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullLogMessage);
    // Add some user feedback if desired
  };


  return (
    <div className="border border-[var(--border-primary)] rounded-md">
      <div className="flex items-center justify-between p-2 bg-[var(--bg-tertiary)]/50 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-center gap-3 overflow-hidden">
            <span className={`font-mono text-xs font-bold ${getLevelColor(entry.level)}`}>[{entry.level}]</span>
            <span className="text-[var(--text-secondary)] truncate">{entry.header}</span>
            <span className="text-[var(--text-muted)] text-xs flex-shrink-0">{new Date(entry.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={(e) => { e.stopPropagation(); copyToClipboard(); }} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]" title="Copy">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
            <span className="transform transition-transform duration-200" style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </span>
        </div>
      </div>
      {!isCollapsed && (
        <pre className="p-4 text-xs bg-[var(--bg-primary)] text-[var(--text-secondary)] overflow-auto rounded-b-md max-h-96">
          {JSON.stringify(entry.details, null, 2)}
        </pre>
      )}
    </div>
  );
};

export const ConsoleDialog: React.FC<ConsoleDialogProps> = ({ isOpen, onClose }) => {
  const { logs, clearLogs } = useLogContext();
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: LogLevel.INFO, label: 'Info' },
    { id: LogLevel.WARN, label: 'Warn' },
    { id: LogLevel.ERROR, label: 'Error' },
    { id: LogLevel.GEMINI, label: 'Gemini' },
    { id: LogLevel.IMAGEN, label: 'Imagen' },
  ];

  const filteredLogs = useMemo(() => {
    if (activeTab === 'all') return logs;
    return logs.filter(log => log.level === activeTab);
  }, [logs, activeTab]);

  const saveLog = () => {
    const data = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_logs_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Console Log">
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center border-b border-[var(--border-primary)] pb-3 mb-3 flex-shrink-0">
                <div className="flex items-center gap-1 flex-wrap">
                {tabs.map(tab => (
                    <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        activeTab === tab.id
                        ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)]'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-secondary)]'
                    }`}
                    >
                    {tab.label}
                    </button>
                ))}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={saveLog} className="px-3 py-1 text-sm rounded-md bg-[var(--bg-tertiary)] hover:opacity-80 transition-colors">Save Log</button>
                    <button onClick={clearLogs} className="px-3 py-1 text-sm rounded-md bg-[var(--color-red)]/80 text-white hover:bg-[var(--color-red)] transition-colors">Clear</button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, index) => <LogDetail key={`${log.timestamp}-${index}`} entry={log} />)
                ) : (
                    <div className="text-center text-[var(--text-muted)] py-10">No logs for this filter.</div>
                )}
            </div>
        </div>
    </Modal>
  );
};