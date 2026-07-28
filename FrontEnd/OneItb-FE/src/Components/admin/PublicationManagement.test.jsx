import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PublicationManagement } from './PublicationManagement';

const loadMore = vi.fn();

vi.mock('@apollo/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useMutation: () => [vi.fn(), { loading: false }],
  };
});

vi.mock('../../hooks/useInquiryPage', () => ({
  useInquiryPage: () => ({
    items: [{
      id: 'post-1',
      title: 'Consulta paginada',
      content: 'Contenido',
      publishDate: '2026-07-27T12:00:00Z',
      reportCount: 0,
      subject: { name: 'Programacion' },
      user: { firstName: 'Ana', lastName: 'Alumno' },
      comments: [],
      reactions: [],
    }],
    totalCount: 15,
    hasNextPage: true,
    loading: false,
    loadingMore: false,
    error: null,
    refetch: vi.fn(),
    loadMore,
  }),
}));

describe('PublicationManagement pagination', () => {
  it('shows the server total and requests another bounded page', () => {
    render(<PublicationManagement />);

    expect(screen.getByText('15 activas')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cargar mas publicaciones' }));
    expect(loadMore).toHaveBeenCalledTimes(1);
  });
});
