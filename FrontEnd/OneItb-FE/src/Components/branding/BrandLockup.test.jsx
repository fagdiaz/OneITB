import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrandLockup } from './BrandLockup';

describe('BrandLockup', () => {
  it('composes the approved symbol and DOM wordmark as one accessible identity', () => {
    const { container } = render(<BrandLockup label="Identidad OneITB" />);

    const lockup = screen.getByRole('img', { name: 'Identidad OneITB' });
    expect(lockup).toHaveTextContent('neITB');
    expect(lockup).not.toHaveTextContent('oneITB');
    expect(lockup).toHaveClass('inline-flex', 'whitespace-nowrap');
    expect(container.querySelector('img')).toHaveAttribute('src', expect.stringContaining('only-logo.png'));
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  it('keeps decorative duplicates out of the accessibility tree', () => {
    const { container } = render(<BrandLockup decorative variant="full" tone="inverse" />);

    const lockup = container.firstElementChild;
    expect(lockup).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(lockup.className).not.toContain('drop-shadow');
  });

  it('does not alter the symbol asset in the default light contract', () => {
    const { container } = render(<BrandLockup />);
    const symbol = container.querySelector('img');

    expect(symbol.className).not.toContain('filter');
    expect(symbol.className).not.toContain('brightness');
    expect(symbol.className).not.toContain('drop-shadow');
  });
});
