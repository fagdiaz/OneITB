import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../context/ThemeContext';
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
      <ThemeProvider>
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(screen.getByRole('heading', { level: 1, name: /Tu recorrido/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Iniciar sesi/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /Crear cuenta institucional/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /Soy empresa/i })).toHaveAttribute('href', '/empleos/solicitud');
    expect(screen.getByText(/Instituto Superior de Formación Técnica N.º 197/i)).toBeInTheDocument();
    expect(screen.getByText(/proyecto académico complementario/i)).toBeInTheDocument();
    expect(screen.getByText(/Fuente institucional consultada el 5 de agosto de 2026/i)).toBeInTheDocument();
    expect(screen.queryByText(/Laboratorio/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Escenario 1/i)).not.toBeInTheDocument();
  });

  it('marks every institutional destination as an external safe link', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      </ThemeProvider>,
    );

    const externalLinks = screen.getAllByRole('link', { name: /abre en una pestaña nueva/i });
    expect(externalLinks).toHaveLength(3);
    externalLinks.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link.getAttribute('href')).toMatch(/^https:\/\//);
    });
  });
});
