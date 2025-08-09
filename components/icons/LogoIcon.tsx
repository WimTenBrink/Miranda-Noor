import React from 'react';

export const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 150 40" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <style>
      {`.logo-text-color { color: var(--logo-text); }`}
    </style>
    <text x="0" y="30" fontFamily="Arial, Helvetica, sans-serif" fontSize="30" fontWeight="bold" className="logo-text-color">MN</text>
    <g transform="translate(60, 15)">
      <path d="M10 18.5c-3.87-3.87-8-8.5-8-11.5a5.5 5.5 0 0 1 11 0c0 3-4.13 7.63-8 11.5z" stroke="#f43f5e" fill="#f43f5e" strokeWidth="1.5" transform="translate(-1, -3) scale(1.2)"/>
       <path d="M15 5 L2 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </g>
    <text x="95" y="30" fontFamily="Arial, Helvetica, sans-serif" fontSize="30" fontWeight="bold" className="logo-text-color">AB</text>
  </svg>
);
