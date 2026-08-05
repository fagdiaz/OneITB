import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from './Header';

const authState = vi.hoisted(() => ({ value: { isAuthenticated: false, token: null } }));

vi.mock('../../../hooks/useAuth', () => ({ default: () => authState.value }));
vi.mock('./GlobalSearch', () => ({ GlobalSearch: () => <div>Buscador</div> }));
vi.mock('./Nav', () => ({ Nav: () => <nav aria-label="Navegacion principal" /> }));

describe('Header', () => {
  beforeEach(() => {
    authState.value = { isAuthenticated: false, token: null };
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0, writable: true });
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it('renders only the theme-invariant OneITB symbol as the home action', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Ir al inicio de OneITB' })).toHaveAttribute('href', '/');
    const homeLink = screen.getByRole('link', { name: 'Ir al inicio de OneITB' });
    expect(homeLink).toHaveTextContent('');
    expect(homeLink.querySelector('img')).toHaveAttribute('src', expect.stringContaining('only-logo.png'));
    expect(screen.queryByText('ONEITB')).not.toBeInTheDocument();
    expect(screen.queryByText('Buscador')).not.toBeInTheDocument();
  });

  it('hides authenticated navigation on downward scroll and reveals it from the top edge', async () => {
    authState.value = { isAuthenticated: true, token: 'test-token' };
    render(<MemoryRouter initialEntries={['/feed']}><Header /></MemoryRouter>);

    const header = screen.getByRole('banner');
    window.scrollY = 320;
    fireEvent.scroll(window);
    await waitFor(() => expect(header).toHaveClass('-translate-y-full'));

    fireEvent.pointerEnter(screen.getByTestId('header-reveal-zone'));
    expect(header).toHaveClass('translate-y-0');
  });

  it('never auto-hides the anonymous header', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    const header = screen.getByRole('banner');
    window.scrollY = 320;
    fireEvent.scroll(window);
    expect(header).not.toHaveClass('-translate-y-full');
  });
});
