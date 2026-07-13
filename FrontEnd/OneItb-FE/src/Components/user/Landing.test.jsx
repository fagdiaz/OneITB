import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Landing } from './Landing';

describe('Landing', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  it('renders the definitive institutional experience and its primary actions', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: /Tu recorrido/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Iniciar sesi/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /Crear cuenta institucional/i })).toHaveAttribute('href', '/register');
    expect(screen.queryByText(/Laboratorio/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Escenario 1/i)).not.toBeInTheDocument();
  });
});
