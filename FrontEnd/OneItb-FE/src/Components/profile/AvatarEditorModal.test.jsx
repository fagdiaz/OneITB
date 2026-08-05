import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AvatarEditorModal } from './AvatarEditorModal';

describe('AvatarEditorModal cleanup', () => {
  const originalImage = globalThis.Image;
  const originalToBlob = HTMLCanvasElement.prototype.toBlob;
  let images;

  beforeEach(() => {
    images = [];
    globalThis.Image = class FakeImage {
      constructor() {
        this.onload = null;
        this.onerror = null;
        this.src = '';
        this.width = 800;
        this.height = 800;
        images.push(this);
      }
    };
  });

  afterEach(() => {
    globalThis.Image = originalImage;
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
    vi.restoreAllMocks();
  });

  it('detaches image callbacks when the modal unmounts', () => {
    const view = render(
      <AvatarEditorModal
        isOpen
        imageSrc="data:image/jpeg;base64,avatar"
        originalFileName="avatar.jpg"
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    const image = images[0];
    expect(image.onload).toEqual(expect.any(Function));
    view.unmount();

    expect(image.onload).toBeNull();
    expect(image.onerror).toBeNull();
    expect(image.src).toBe('');
  });

  it('ignores a late canvas export after unmount', () => {
    let finishExport;
    HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
      finishExport = callback;
    });
    const onSave = vi.fn();
    const view = render(
      <AvatarEditorModal
        isOpen
        imageSrc="data:image/jpeg;base64,avatar"
        originalFileName="avatar.jpg"
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar Imagen' }));
    view.unmount();
    finishExport(new Blob(['avatar'], { type: 'image/jpeg' }));

    expect(onSave).not.toHaveBeenCalled();
  });
});
