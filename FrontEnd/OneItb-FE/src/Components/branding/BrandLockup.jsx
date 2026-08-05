import React from 'react';
import { BrandLogo } from './BrandLogo';

const SIZE_CLASSES = {
  compact: {
    wrapper: 'gap-2',
    symbol: 'h-8 w-8 sm:h-9 sm:w-9',
    wordmark: 'text-[1.05rem] sm:text-lg',
  },
  full: {
    wrapper: 'gap-3',
    symbol: 'h-12 w-12 sm:h-14 sm:w-14',
    wordmark: 'text-3xl sm:text-4xl',
  },
};

export const BrandLockup = ({
  variant = 'compact',
  tone = 'default',
  decorative = false,
  label = 'OneITB',
  className = '',
  symbolClassName = '',
  loading = 'eager',
  fetchpriority,
}) => {
  const sizes = SIZE_CLASSES[variant] ?? SIZE_CLASSES.compact;
  const baseText = tone === 'inverse'
    ? 'text-slate-100'
    : 'text-slate-800 dark:text-slate-100';
  const accentText = tone === 'inverse'
    ? 'text-cyan-300'
    : 'text-blue-700 dark:text-cyan-300';

  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? 'true' : undefined}
      className={`inline-flex shrink-0 select-none items-center whitespace-nowrap ${sizes.wrapper} ${className}`.trim()}
    >
      <BrandLogo
        variant="symbol"
        decorative
        className={`shrink-0 object-contain ${sizes.symbol} ${symbolClassName}`.trim()}
        loading={loading}
        fetchpriority={fetchpriority}
      />
      <span aria-hidden="true" className={`font-extrabold tracking-[-0.045em] ${sizes.wordmark} ${baseText}`}>
        ne<span className={accentText}>ITB</span>
      </span>
    </span>
  );
};
