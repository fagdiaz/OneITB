import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearYouTubeTitleCache, RichPublicationText } from './RichPublicationText';

describe('RichPublicationText', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearYouTubeTitleCache();
  });

  it('renders plain text when no links or mentions are present', () => {
    render(
      <MemoryRouter>
        <RichPublicationText text="Consulta sobre el examen final de programación" />
      </MemoryRouter>,
    );
    expect(screen.getByText('Consulta sobre el examen final de programación')).toBeInTheDocument();
  });

  it('transforms user mentions into profile links', () => {
    const users = [
      { id: 'user-42', firstName: 'Juan', username: 'juanp' },
    ];
    render(
      <MemoryRouter>
        <RichPublicationText text="Hola @Juan podes revisar esto?" users={users} />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: '@Juan' });
    expect(link).toHaveAttribute('href', '/profile/user-42');
  });

  it('transforms a single YouTube URL into a video title link', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: 'Tutorial de React 18 en Español' }),
    });

    render(
      <MemoryRouter>
        <RichPublicationText text="Miren este tutorial: https://www.youtube.com/watch?v=dQw4w9WgXcQ genial" />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Tutorial de React 18 en Español')).toBeInTheDocument();
    });

    const ytLink = screen.getByRole('link', { name: /Tutorial de React 18 en Español/ });
    expect(ytLink).toHaveAttribute('href', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(ytLink).toHaveAttribute('target', '_blank');
  });

  it('transforms multiple YouTube URLs into individual video title links', async () => {
    global.fetch = vi.fn()
      .mockImplementation(async (url) => {
        if (url.includes('dQw4w9WgXcQ')) {
          return { ok: true, json: async () => ({ title: 'Primer Video Intro' }) };
        }
        return { ok: true, json: async () => ({ title: 'Segundo Video Avanzado' }) };
      });

    render(
      <MemoryRouter>
        <RichPublicationText text="Parte 1: https://youtu.be/dQw4w9WgXcQ y Parte 2: https://www.youtube.com/watch?v=9bZkp7q19f0 fin" />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Primer Video Intro')).toBeInTheDocument();
      expect(screen.getByText('Segundo Video Avanzado')).toBeInTheDocument();
    });

    const link1 = screen.getByRole('link', { name: /Primer Video Intro/ });
    expect(link1).toHaveAttribute('href', 'https://youtu.be/dQw4w9WgXcQ');

    const link2 = screen.getByRole('link', { name: /Segundo Video Avanzado/ });
    expect(link2).toHaveAttribute('href', 'https://www.youtube.com/watch?v=9bZkp7q19f0');
  });
});
