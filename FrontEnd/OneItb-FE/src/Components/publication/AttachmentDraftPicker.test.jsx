import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AttachmentDraftPicker } from './AttachmentDraftPicker';
import { getFileIdentity } from '../../utils/uploadFile';

describe('AttachmentDraftPicker', () => {
  it('accumulates several selected files in one change', () => {
    const onChange = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <AttachmentDraftPicker files={[]} onChange={onChange} onError={onError} />,
    );
    const files = [
      new File(['guia'], 'Guia.txt', { type: 'text/plain', lastModified: 1 }),
      new File(['notas'], 'Notas.txt', { type: 'text/plain', lastModified: 2 }),
    ];

    fireEvent.change(container.querySelector('input[type="file"]'), { target: { files } });

    expect(onChange).toHaveBeenCalledWith(files);
    expect(onError).toHaveBeenCalledWith(null);
  });

  it('removes only the selected draft attachment', () => {
    const first = new File(['uno'], 'Uno.txt', { type: 'text/plain', lastModified: 1 });
    const second = new File(['dos'], 'Dos.txt', { type: 'text/plain', lastModified: 2 });
    const onChange = vi.fn();

    render(<AttachmentDraftPicker files={[first, second]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Uno.txt' }));

    expect(onChange).toHaveBeenCalledWith([second]);
  });

  it('accepts dropped files through the same validation path', () => {
    const onChange = vi.fn();
    const onError = vi.fn();
    const file = new File(['guia'], 'Guia.txt', { type: 'text/plain', lastModified: 1 });

    render(<AttachmentDraftPicker files={[]} onChange={onChange} onError={onError} />);
    fireEvent.drop(screen.getByTestId('attachment-dropzone'), {
      dataTransfer: { files: [file] },
    });

    expect(onChange).toHaveBeenCalledWith([file]);
    expect(onError).toHaveBeenCalledWith(null);
  });

  it('rejects duplicated dropped files without changing the draft', () => {
    const existing = new File(['guia'], 'Guia.txt', { type: 'text/plain', lastModified: 1 });
    const onChange = vi.fn();
    const onError = vi.fn();

    render(<AttachmentDraftPicker files={[existing]} onChange={onChange} onError={onError} />);
    fireEvent.drop(screen.getByTestId('attachment-dropzone'), {
      dataTransfer: { files: [existing] },
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith('Los archivos seleccionados ya estaban adjuntos.');
  });

  it('lets the composer select an attachment as cover', () => {
    const onCoverChange = vi.fn();
    const file = new File(['image'], 'cover.png', { type: 'image/png', lastModified: 1 });
    render(
      <AttachmentDraftPicker
        files={[file]}
        onChange={vi.fn()}
        allowCoverSelection
        coverFileIdentity={null}
        onCoverChange={onCoverChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Usar de portada' }));
    expect(onCoverChange).toHaveBeenCalledWith(getFileIdentity(file));
  });
});
