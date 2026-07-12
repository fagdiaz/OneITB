import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AttachmentDraftPicker } from './AttachmentDraftPicker';

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
});
