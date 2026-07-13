import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MediaComponent from './MediaComponent';

describe('MediaComponent', () => {
  it('renders YouTube and persisted attachments together', () => {
    render(
      <MockedProvider>
        <MediaComponent
          textContext="Mira https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          attachments={[
            {
              id: 'attachment-1',
              fileUrl: '/uploads/hashed-name.pdf',
              originalFileName: 'OneITB.pdf',
              contentType: 'application/pdf',
              size: 1024,
              sortOrder: 0,
            },
          ]}
        />
      </MockedProvider>,
    );

    expect(screen.getByText('Video de YouTube')).toBeInTheDocument();
    expect(screen.getByText('OneITB.pdf')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reproducir video de youtube/i })).toBeInTheDocument();
  });

  it('falls back when a link preview image cannot be loaded', () => {
    render(
      <MockedProvider>
        <MediaComponent
          previewData={{
            success: true,
            originalUrl: 'https://sitio.test/recurso',
            domain: 'sitio.test',
            title: 'Recurso institucional',
            description: 'Vista previa academica',
            imageUrl: 'https://sitio.test/rota.jpg',
          }}
        />
      </MockedProvider>,
    );

    fireEvent.error(screen.getByAltText('Recurso institucional'));

    expect(screen.queryByAltText('Recurso institucional')).not.toBeInTheDocument();
    expect(screen.getByText('sitio.test')).toBeInTheDocument();
    expect(screen.getByText('Recurso institucional')).toBeInTheDocument();
  });

  it('keeps the selected image cover complete and promotes YouTube into a crowded grid', () => {
    const attachments = Array.from({ length: 5 }, (_, index) => ({
      id: `attachment-${index}`,
      fileUrl: `/uploads/image-${index}.png`,
      originalFileName: index === 0 ? 'Portada.png' : `Imagen-${index}.png`,
      contentType: 'image/png',
      size: 1024,
      sortOrder: index,
    }));

    render(
      <MockedProvider>
        <MediaComponent
          textContext="Video https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          attachments={attachments}
          preferAttachmentCover
        />
      </MockedProvider>,
    );

    expect(screen.getByAltText('Archivo adjunto: Portada.png')).toHaveClass('object-contain');
    expect(screen.getByRole('button', { name: /reproducir video de youtube/i })).toBeInTheDocument();
  });
});
