import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrandLogo } from './BrandLogo';

describe('BrandLogo', () => {
  it('uses the approved compact symbol with accessible text', () => {
    render(<BrandLogo variant="symbol" alt="Inicio de OneITB" fetchpriority="high" />);

    const logo = screen.getByRole('img', { name: 'Inicio de OneITB' });
    expect(logo).toHaveAttribute('src', expect.stringContaining('only-logo.png'));
    expect(logo).toHaveAttribute('decoding', 'async');
    expect(logo).toHaveAttribute('fetchpriority', 'high');
    expect(logo.className).not.toContain('drop-shadow');
  });

  it('uses the approved full mark and supports decorative rendering', () => {
    const { container } = render(<BrandLogo variant="full" decorative loading="lazy" />);

    const logo = container.querySelector('img');
    expect(logo).toHaveAttribute('src', expect.stringContaining('logo-oneitb.png'));
    expect(logo).toHaveAttribute('alt', '');
    expect(logo).toHaveAttribute('aria-hidden', 'true');
    expect(logo).toHaveAttribute('loading', 'lazy');
  });
});
