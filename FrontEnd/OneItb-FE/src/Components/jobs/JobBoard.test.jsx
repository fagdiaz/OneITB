import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { JobBoard } from './JobBoard';

const offerId = '10000000-0000-0000-0000-000000000001';

vi.mock('../../hooks/useAuth', () => ({
  default: () => ({ auth: { id: 'user-1', role: 'Estudiante' } }),
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
