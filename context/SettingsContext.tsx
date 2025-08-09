import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface SettingsContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('userApiKey');
    if (storedKey) {
      setApiKeyState(storedKey);
    }
  }, []);

  const setApiKey = (key: string) => {
    localStorage.setItem('userApiKey', key);
    setApiKeyState(key);
  };

  return (
    <SettingsContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
