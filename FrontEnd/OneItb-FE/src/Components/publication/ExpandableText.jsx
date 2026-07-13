import React, { useId, useState } from 'react';

export const ExpandableText = ({ children, className = '', clampLines = 4 }) => {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const text = typeof children === 'string' ? children : '';
  const isLikelyLong = text.length > 280 || text.split(/\r?\n/).length > clampLines;

  return (
    <div>
      <p
        id={contentId}
        className={`${className} ${!expanded && isLikelyLong ? 'line-clamp-4' : ''}`}
      >
        {children}
      </p>
      {isLikelyLong && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-controls={contentId}
          className="mt-1 text-xs font-semibold text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-300 dark:hover:text-blue-200"
        >
          {expanded ? 'Leer menos' : 'Leer mas'}
        </button>
      )}
    </div>
  );
};
