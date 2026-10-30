import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JobBoard } from './JobBoard';

const offerId = '10000000-0000-0000-0000-000000000001';

let currentAuth = { id: 'user-1', role: 'Estudiante' };

vi.mock('../../hooks/useAuth', () => ({
  default: () => ({ auth: currentAuth }),
}));

vi.mock('@apollo/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useQuery: () => ({
      data: {
        jobOffers: {
          nodes: [{
            id: offerId,
            title: 'Desarrollador Junior',
            company: 'Beltran Tech',
            description: 'Primera experiencia profesional.',
            location: 'Avellaneda',
            createdAt: '2026-07-12T12:00:00Z',
            applications: [],
            employer: { fullName: 'Empleador Demo' },
          }],
        },
      },
      loading: false,
      error: null,
    }),
    useSubscription: () => ({ data: undefined }),
    useMutation: () => [vi.fn(), { loading: false }],
  };
});

describe('JobBoard notification target', () => {
  beforeEach(() => {
    currentAuth = { id: 'user-1', role: 'Estudiante' };
  });

  it('focuses and highlights the exact offer from the action URL', async () => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
    render(
      <MemoryRouter initialEntries={[`/empleos?jobOfferId=${offerId}`]}>
        <JobBoard />
      </MemoryRouter>,
    );

    const card = screen.getByRole('article', { name: /Desarrollador Junior/i });
    await waitFor(() => expect(card).toHaveFocus());
    expect(card).toHaveClass('ring-2');
    expect(card.scrollIntoView).toHaveBeenCalled();
  });
});

describe('JobBoard publication modal ergonomics', () => {
  beforeEach(() => {
    currentAuth = { id: 'user-employer', role: 'Empleador' };
  });

  it('opens modal, closes with Escape key, and has accessible header close button', () => {
    render(
      <MemoryRouter>
        <JobBoard />
      </MemoryRouter>,
    );

    const openBtn = screen.getByRole('button', { name: /publicar oferta/i });
    fireEvent.click(openBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar modal' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes modal when clicking outside on the backdrop, but not when clicking inside form', () => {
    render(
      <MemoryRouter>
        <JobBoard />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /publicar oferta/i }));
    const backdrop = screen.getByRole('dialog');
    const titleInput = screen.getByRole('textbox', { name: /titulo/i });

    // Click inside form does not close
    fireEvent.mouseDown(titleInput);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click on backdrop container closes modal
    fireEvent.mouseDown(backdrop);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
