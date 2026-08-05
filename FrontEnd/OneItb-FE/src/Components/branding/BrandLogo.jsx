import React from 'react';
import fullLogo from '../../assets/logo-oneitb.png';
import darkFullLogo from '../../assets/logo-oneitb-dark-mode.png';
import symbolLogo from '../../assets/only-logo.png';
import { useTheme } from '../../context/ThemeContext';

const LogoImage = ({ source, alt, decorative, className, loading, fetchpriority }) => (
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

const ThemedFullLogo = (props) => {
  const { isDark } = useTheme();
  return <LogoImage {...props} source={isDark ? darkFullLogo : fullLogo} />;
};

export const BrandLogo = ({
  variant = 'full',
  alt = 'OneITB',
  decorative = false,
  className = '',
  loading = 'eager',
  fetchpriority,
}) => {
  const imageProps = {
    alt,
    decorative,
    className,
    loading,
    fetchpriority,
  };

  if (variant === 'symbol') {
    return <LogoImage {...imageProps} source={symbolLogo} />;
  }

  return <ThemedFullLogo {...imageProps} />;
};
