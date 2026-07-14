import React from 'react';
import fullLogo from '../../assets/logo-oneitb.png';
import symbolLogo from '../../assets/only-logo.png';

const SOURCES = {
  full: fullLogo,
  symbol: symbolLogo,
};

export const BrandLogo = ({
  variant = 'full',
  alt = 'OneITB',
  decorative = false,
  className = '',
  loading = 'eager',
  fetchpriority,
  enhanceOnDark = true,
}) => {
  const source = SOURCES[variant] ?? SOURCES.full;

  return (
    <img
      src={source}
      alt={decorative ? '' : alt}
      aria-hidden={decorative ? 'true' : undefined}
      className={`${enhanceOnDark ? 'dark:drop-shadow-[0_0_10px_rgba(248,250,252,0.58)]' : ''} ${className}`.trim()}
      loading={loading}
      decoding="async"
      fetchpriority={fetchpriority}
    />
  );
};
