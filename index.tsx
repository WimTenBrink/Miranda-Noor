import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GenerationProvider } from './context/GenerationContext';
import { SettingsProvider } from './context/SettingsContext';
import { LogProvider } from './context/LogContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SettingsProvider>
      <LogProvider>
        <GenerationProvider>
            <App />
        </GenerationProvider>
      </LogProvider>
    </SettingsProvider>
  </React.StrictMode>
);