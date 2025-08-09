import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [show, setShow] = useState(false);

  // The 'aria-describedby' prop is valid for HTML elements, but TypeScript
  // cannot always infer this from the generic `React.ReactElement` type of `children`.
  // Assigning the props to a variable first bypasses TypeScript's excess property
  // checking on object literals, resolving the type error with cloneElement.
  const newProps = {
    'aria-describedby': `tooltip-${text}`
  };

  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {React.cloneElement(children, newProps)}
      {show && (
        <div 
            id={`tooltip-${text}`}
            role="tooltip"
            className="absolute z-10 w-64 p-2.5 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-lg bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none"
        >
          {text}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-[var(--bg-secondary)]"></div>
        </div>
      )}
    </div>
  );
};