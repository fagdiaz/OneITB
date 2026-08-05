import React from 'react';
import { BrandLogo } from './BrandLogo';

const SIZE_CLASSES = {
  compact: 'h-14 w-32 sm:h-16 sm:w-36',
  full: 'h-28 w-60 sm:h-32 sm:w-72',
};

export const BrandLockup = ({
  variant = 'compact',
  decorative = false,
  label = 'OneITB',
  className = '',
  imageClassName = '',
  loading = 'eager',
  fetchpriority,
}) => {
  const sizes = SIZE_CLASSES[variant] ?? SIZE_CLASSES.compact;

  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? 'true' : undefined}
      className={`relative inline-flex shrink-0 select-none overflow-hidden ${sizes} ${className}`.trim()}
    >
      <BrandLogo
        variant="full"
        decorative
        className={`absolute left-0 top-1/2 w-full max-w-none -translate-y-1/2 object-contain ${imageClassName}`.trim()}
        loading={loading}
        fetchpriority={fetchpriority}
      />
    </span>
  );
};
