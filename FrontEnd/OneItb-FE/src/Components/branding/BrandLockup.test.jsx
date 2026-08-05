import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../../context/ThemeContext';
import { BrandLockup } from './BrandLockup';

const renderLockup = (element) => render(<ThemeProvider>{element}</ThemeProvider>);

describe('BrandLockup', () => {
  it('renders the approved full asset as one accessible identity', () => {
    const { container } = renderLockup(<BrandLockup label="Identidad OneITB" />);

    const lockup = screen.getByRole('img', { name: 'Identidad OneITB' });
    expect(lockup).toHaveClass('inline-flex', 'overflow-hidden');
    expect(lockup).toHaveTextContent('');
    expect(container.querySelector('img')).toHaveAttribute('src', expect.stringContaining('logo-oneitb.png'));
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  it('keeps decorative duplicates out of the accessibility tree', () => {
    const { container } = renderLockup(<BrandLockup decorative variant="full" />);

    const lockup = container.firstElementChild;
    expect(lockup).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(lockup.className).not.toContain('drop-shadow');
  });

  it('does not alter the full asset in the default light contract', () => {
    const { container } = renderLockup(<BrandLockup />);
    const logo = container.querySelector('img');

    expect(logo.className).not.toContain('filter');
    expect(logo.className).not.toContain('brightness');
    expect(logo.className).not.toContain('drop-shadow');
  });
});
