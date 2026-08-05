import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';
import { BrandLogo } from './BrandLogo';

const ThemeHarness = ({ children }) => {
  const { setTheme } = useTheme();
  return (
    <>
      <button type="button" onClick={() => setTheme('dark')}>Tema oscuro</button>
      {children}
    </>
  );
};

describe('BrandLogo', () => {
  it('uses the approved compact symbol with accessible text', () => {
    render(<BrandLogo variant="symbol" alt="Inicio de OneITB" fetchpriority="high" />);

    const logo = screen.getByRole('img', { name: 'Inicio de OneITB' });
    expect(logo).toHaveAttribute('src', expect.stringContaining('only-logo.png'));
    expect(logo).toHaveAttribute('decoding', 'async');
    expect(logo).toHaveAttribute('fetchpriority', 'high');
    expect(logo.className).not.toContain('drop-shadow');
  });

  it('uses the light full mark by default and supports decorative rendering', () => {
    const { container } = render(
      <ThemeProvider>
        <BrandLogo variant="full" decorative loading="lazy" />
      </ThemeProvider>,
    );

    const logo = container.querySelector('img');
    expect(logo).toHaveAttribute('src', expect.stringContaining('logo-oneitb.png'));
    expect(logo).toHaveAttribute('alt', '');
    expect(logo).toHaveAttribute('aria-hidden', 'true');
    expect(logo).toHaveAttribute('loading', 'lazy');
  });

  it('switches only the full mark to the approved dark-mode asset', () => {
    render(
      <ThemeProvider>
        <ThemeHarness>
          <BrandLogo variant="full" alt="OneITB" />
        </ThemeHarness>
      </ThemeProvider>,
    );

    const logo = screen.getByRole('img', { name: 'OneITB' });
    expect(logo).toHaveAttribute('src', expect.stringContaining('logo-oneitb.png'));

    fireEvent.click(screen.getByRole('button', { name: 'Tema oscuro' }));

    expect(logo).toHaveAttribute('src', expect.stringContaining('logo-oneitb-dark-mode.png'));
    expect(logo.className).not.toContain('drop-shadow');
    expect(logo.className).not.toContain('filter');
  });
});
