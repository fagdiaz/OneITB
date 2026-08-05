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
}) => {
  const source = SOURCES[variant] ?? SOURCES.full;

  return (
    <img
      src={source}
      alt={decorative ? '' : alt}
      aria-hidden={decorative ? 'true' : undefined}
      className={className}
      loading={loading}
      decoding="async"
      fetchpriority={fetchpriority}
    />
  );
};
