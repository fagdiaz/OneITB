import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MediaViewerModal } from './MediaViewerModal';

describe('MediaViewerModal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('navigates within the provided image gallery using keyboard arrows', () => {
    render(
      <MediaViewerModal
        isOpen
        onClose={vi.fn()}
        type="image"
        galleryItems={[
          { src: '/one.png', title: 'Primera imagen' },
          { src: '/two.png', title: 'Segunda imagen' },
        ]}
      />,
    );

    expect(screen.getByRole('img', { name: 'Primera imagen' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByRole('img', { name: 'Segunda imagen' })).toBeInTheDocument();
    expect(screen.getByText('Imagen 2 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Imagen anterior' })).not.toHaveClass('rounded-full');
    expect(screen.getByRole('button', { name: 'Imagen anterior' }).className).toContain('drop-shadow');
  });

  it('loads a PDF through an object URL and revokes it on cleanup', async () => {
    const createObjectURL = vi.fn(() => 'blob:pdf-preview');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' })),
    }));

    const { unmount } = render(
      <MediaViewerModal isOpen onClose={vi.fn()} type="pdf" src="https://localhost/uploads/test.pdf" title="Test PDF" />,
    );

    await waitFor(() => expect(screen.getByRole('dialog').querySelector('iframe')).toHaveAttribute('src', expect.stringContaining('blob:pdf-preview')));
    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:pdf-preview');
  });

  it('keeps the YouTube iframe inside a bounded aspect-ratio viewport', () => {
    render(
      <MediaViewerModal
        isOpen
        onClose={vi.fn()}
        type="youtube"
        videoId="dQw4w9WgXcQ"
        title="Video de prueba"
      />,
    );

    const iframe = screen.getByRole('dialog').querySelector('iframe');
    expect(iframe).toHaveClass('absolute', 'inset-0', 'h-full', 'w-full');
    expect(iframe.parentElement).toHaveClass('aspect-video', 'overflow-hidden');
  });
});
