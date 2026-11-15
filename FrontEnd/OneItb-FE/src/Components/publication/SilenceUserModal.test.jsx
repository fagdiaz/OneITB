import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SilenceUserModal } from './SilenceUserModal';

const targetUser = {
  id: 'user-infractor-1',
  firstName: 'Infractor',
  lastName: 'Disciplinario',
};

const TestHost = ({ defaultSubmitting = false, onConfirmMock = vi.fn() }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(defaultSubmitting);

  return (
    <div>
      <button
        type="button"
        data-testid="opener-button"
        onClick={() => setIsOpen(true)}
      >
        Abrir Silencio
      </button>

      <button
        type="button"
        data-testid="toggle-submitting"
        onClick={() => setSubmitting((prev) => !prev)}
      >
        Toggle Submitting
      </button>

      <SilenceUserModal
        target={isOpen ? targetUser : null}
        submitting={submitting}
        onClose={() => setIsOpen(false)}
        onConfirm={onConfirmMock}
      />
    </div>
  );
};

describe('SilenceUserModal Accessibility and Keyboard Focus Contract', () => {
  it('focuses the close button upon open, traps Tab forward and Shift+Tab backward', async () => {
    render(<TestHost />);
    const opener = screen.getByTestId('opener-button');
    opener.focus();
    expect(opener).toHaveFocus();

    fireEvent.click(opener);

    const dialog = screen.getByRole('dialog', { name: 'Silenciar Usuario (Moderación)' });
    expect(dialog).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Cerrar modal de silenciamiento' });
    const confirmBtn = screen.getByRole('button', { name: /Confirmar silencio/i });

    // Initial focus placed automatically by the component via requestAnimationFrame
    await waitFor(() => {
      expect(closeBtn).toHaveFocus();
    });

    // Tab trap: when at the last interactive control (confirmBtn), pressing Tab wraps to first (closeBtn)
    confirmBtn.focus();
    expect(confirmBtn).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeBtn).toHaveFocus();

    // Shift+Tab trap: when at the first interactive control (closeBtn), pressing Shift+Tab wraps to last (confirmBtn)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(confirmBtn).toHaveFocus();
  });

  it('closes on Escape when idle and restores focus to opener button', () => {
    render(<TestHost />);
    const opener = screen.getByTestId('opener-button');
    opener.focus();
    expect(opener).toHaveFocus();

    fireEvent.click(opener);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });

    // Dialog closes and opener button regains focus
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(opener).toHaveFocus();
  });

  it('blocks Escape and backdrop clicks when submitting is true', () => {
    render(<TestHost defaultSubmitting={true} />);
    const opener = screen.getByTestId('opener-button');
    fireEvent.click(opener);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Press Escape while submitting
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click backdrop while submitting
    const backdrop = dialog.parentElement;
    fireEvent.mouseDown(backdrop);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('confines focus to the dialog container during submitting when controls are disabled', async () => {
    render(<TestHost defaultSubmitting={true} />);
    const opener = screen.getByTestId('opener-button');
    opener.focus();
    fireEvent.click(opener);

    const dialog = screen.getByRole('dialog', { name: 'Silenciar Usuario (Moderación)' });
    expect(dialog).toBeInTheDocument();

    // Verify all buttons are disabled during submitting
    const buttons = dialog.querySelectorAll('button');
    buttons.forEach((btn) => expect(btn).toBeDisabled());

    // When Tab is pressed during submitting, focus must not leak; it remains on the dialog container
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(dialog).toHaveFocus();

    // When Shift+Tab is pressed during submitting, focus remains on the dialog container
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(dialog).toHaveFocus();
  });

  it('restores focus to custom restoreFocusTo target when provided', () => {
    const customTarget = document.createElement('button');
    document.body.appendChild(customTarget);
    customTarget.focus();

    const onClose = vi.fn();
    const { unmount } = render(
      <SilenceUserModal
        target={targetUser}
        restoreFocusTo={customTarget}
        onClose={onClose}
        onConfirm={vi.fn()}
      />
    );

    unmount();
    expect(customTarget).toHaveFocus();
    document.body.removeChild(customTarget);
  });

  it('allows selecting sanction duration and dispatches onConfirm with selected hours', () => {
    const onConfirmMock = vi.fn();
    render(<TestHost onConfirmMock={onConfirmMock} />);

    fireEvent.click(screen.getByTestId('opener-button'));

    // Default duration is 24 hs
    expect(screen.getByRole('button', { name: 'Confirmar silencio (24 hs)' })).toBeInTheDocument();

    // Select 3 días (72 hs)
    fireEvent.click(screen.getByRole('button', { name: '3 días' }));
    expect(screen.getByRole('button', { name: 'Confirmar silencio (72 hs)' })).toBeInTheDocument();

    // Confirm
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar silencio (72 hs)' }));
    expect(onConfirmMock).toHaveBeenCalledWith(72);
  });
});
