import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full py-2 mt-auto bg-[var(--bg-secondary)] border-t border-[var(--border-primary)]">
      <div className="container mx-auto text-center">
        <p className="text-xs text-[var(--text-muted)]">
          &copy; {currentYear} Miranda Noor & Annelies Brink. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};