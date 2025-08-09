import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Modal } from './Modal';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey } = useSettings();
  const [localKey, setLocalKey] = useState(apiKey || '');
  
  useEffect(() => {
    if (isOpen) {
        setLocalKey(apiKey || '');
    }
  }, [apiKey, isOpen]);

  const handleSave = () => {
    setApiKey(localKey);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        <p className="text-[var(--text-secondary)]">
          Enter your Google AI API key below. Your key is saved only in your browser's local storage and is never sent to our servers. You can get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-secondary)] hover:underline">Google AI Studio</a>.
        </p>
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
            Google AI API Key
          </label>
          <input
            type="text"
            id="apiKey"
            name="apiKey"
            autoComplete="on"
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
            placeholder="Enter your API key here"
          />
        </div>
        <div className="flex justify-end items-center gap-4 pt-4">
            <button
                onClick={onClose}
                className="px-6 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-secondary)]"
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                className="px-6 py-2 bg-[var(--accent-primary)] text-[var(--text-on-accent)] rounded-md hover:bg-[var(--accent-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-primary)]"
            >
                Save & Close
            </button>
        </div>
      </div>
    </Modal>
  );
};
