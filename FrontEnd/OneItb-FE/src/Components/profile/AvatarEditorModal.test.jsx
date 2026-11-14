import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('manages full focus lifecycle: initial focus, Tab/Shift+Tab trapping, focus preservation on rerender, Escape blocked while saving, and restoration upon close', async () => {
    const TestParent = () => {
      const [isOpen, setIsOpen] = React.useState(false);
      const [saving, setSaving] = React.useState(false);
      const [renderCount, setRenderCount] = React.useState(0);

      return (
        <div>
          <button type="button" onClick={() => setIsOpen(true)}>
            Abrir Avatar
          </button>
          <button type="button" onClick={() => setSaving((s) => !s)}>
            Toggle Saving ({saving ? 'saving' : 'idle'})
          </button>
          <button type="button" onClick={() => setRenderCount((c) => c + 1)}>
            Rerender ({renderCount})
          </button>
          <AvatarEditorModal
            isOpen={isOpen}
            imageSrc="data:image/jpeg;base64,avatar"
            originalFileName="avatar.jpg"
            saving={saving}
            onClose={() => setIsOpen(false)}
            onSave={vi.fn()}
          />
        </div>
      );
    };

    render(<TestParent />);

    const openerButton = screen.getByRole('button', { name: 'Abrir Avatar' });
    openerButton.focus();
    expect(openerButton).toHaveFocus();

    // Open modal
    fireEvent.click(openerButton);

    // Initial focus enters modal (close button or first focusable)
    const closeButton = await screen.findByRole('button', { name: 'Cerrar editor de avatar' });
    await waitFor(() => {
      expect(closeButton).toHaveFocus();
    });

    const resetButton = screen.getByRole('button', { name: 'Restablecer ajustes' });
    const rotateLeftButton = screen.getByRole('button', { name: /Rotar izq/i });

    // Focus an intermediate control
    rotateLeftButton.focus();
    expect(rotateLeftButton).toHaveFocus();

    // Rerender parent - focus must NOT be reset or stolen back to opener or closeButton!
    fireEvent.click(screen.getByRole('button', { name: /Rerender/ }));
    expect(rotateLeftButton).toHaveFocus();

    // Tab trap: from last focusable (resetButton) pressing Tab wraps to first focusable (closeButton)
    resetButton.focus();
    expect(resetButton).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    // Shift+Tab trap: from first focusable (closeButton) pressing Shift+Tab wraps to last focusable (resetButton)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(resetButton).toHaveFocus();

    // Toggle saving = true: Escape must be blocked
    fireEvent.click(screen.getByRole('button', { name: /Toggle Saving/ }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Toggle saving = false: Escape closes and restores focus to openerButton
    fireEvent.click(screen.getByRole('button', { name: /Toggle Saving/ }));
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(openerButton).toHaveFocus();
    });
  });
});
