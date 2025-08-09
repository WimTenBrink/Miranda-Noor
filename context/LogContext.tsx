import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { LogEntry, LogLevel } from '../types';

interface LogContextType {
  logs: LogEntry[];
  log: (entry: Omit<LogEntry, 'timestamp'>) => void;
  clearLogs: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const LogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const log = useCallback((entry: Omit<LogEntry, 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    setLogs(prevLogs => [newEntry, ...prevLogs]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <LogContext.Provider value={{ logs, log, clearLogs }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLogContext = (): LogContextType => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useLogContext must be used within a LogProvider');
  }
  return context;
};
