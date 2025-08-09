import React from 'react';

interface NavigationButtonsProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrev,
  onNext,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  prevDisabled = false,
  nextDisabled = false,
}) => {
  return (
    <div className={`flex mt-8 pt-6 border-t border-[var(--border-primary)] ${onPrev ? 'justify-between' : 'justify-end'}`}>
      {onPrev && (
        <button
          onClick={onPrev}
          disabled={prevDisabled}
          className="px-6 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold rounded-md hover:opacity-80 disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed transition-opacity"
        >
          {prevLabel}
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="px-6 py-2 bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-semibold rounded-md hover:bg-[var(--accent-hover)] disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed transition-colors"
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
};