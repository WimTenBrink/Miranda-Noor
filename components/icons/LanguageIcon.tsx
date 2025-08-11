
import React from 'react';

export const LanguageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M3 5h12M9 3v2m4.25 16a9.002 9.002 0 00-11.52-4.13l-1.38 1.38a.5.5 0 000 .707l2.122 2.122a.5.5 0 00.707 0l1.379-1.379A9 9 0 0021 12h-2.121A7 7 0 015.879 5.879v-.707A9 9 0 009.25 21zM11 5.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" 
    />
  </svg>
);
