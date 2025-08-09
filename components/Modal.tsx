import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[var(--bg-modal-overlay)] z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-secondary)] rounded-lg shadow-2xl flex flex-col w-[90vw] h-[90vh] border border-[var(--border-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-primary)] flex-shrink-0">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-hidden flex-grow flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};
