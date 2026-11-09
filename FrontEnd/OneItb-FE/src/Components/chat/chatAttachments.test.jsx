import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatWindow } from './ChatWindow';
import { PrivateAttachmentView } from './PrivateAttachmentView';
import { PrivateAttachmentDraft, PrivateAttachmentPreviewList } from './PrivateAttachmentDraft';

describe('Chat Attachments (CHAT-A)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders draft attachments preview chips and allows removal', () => {
    const file1 = new File(['dummy content'], 'reporte.pdf', { type: 'application/pdf' });
    const file2 = new File(['dummy image'], 'captura.png', { type: 'image/png' });
    const handleRemove = vi.fn();

    render(
      <PrivateAttachmentPreviewList
        draftFiles={[file1, file2]}
        onRemove={handleRemove}
      />
    );

    expect(screen.getByText('reporte.pdf')).toBeInTheDocument();
    expect(screen.getByText('captura.png')).toBeInTheDocument();

    const removeButtons = screen.getAllByRole('button', { name: /Quitar archivo/i });
    expect(removeButtons).toHaveLength(2);

    fireEvent.click(removeButtons[0]);
    expect(handleRemove).toHaveBeenCalledWith(0);
  });

  it('enables sending when only an attachment is drafted without text', () => {
    const file = new File(['content'], 'diagrama.png', { type: 'image/png' });
    const handleSubmit = vi.fn((e) => e.preventDefault());

    render(
      <ChatWindow
        selectedContact={{ userId: 'u-1', firstName: 'Juan', lastName: 'Perez', role: 'Estudiante' }}
        selectedContactId="u-1"
        toggleWidget={vi.fn()}
        handleBackToContacts={vi.fn()}
        conversationData={{ conversation: { nodes: [] } }}
        conversationLoading={false}
        messages={[]}
        loadOlderMessages={vi.fn()}
        messageEndRef={{ current: null }}
        feedback=""
        subscriptionError=""
        handleSubmit={handleSubmit}
        form={{ content: '' }}
        changed={vi.fn()}
        sending={false}
        auth={{ id: 'me-1' }}
        draftFiles={[file]}
        setDraftFiles={vi.fn()}
      />
    );

    const sendBtn = screen.getByRole('button', { name: /Enviar mensaje/i });
    expect(sendBtn).not.toBeDisabled();

    fireEvent.click(sendBtn);
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('renders document attachment card in message bubble with formatted size and download action', () => {
    const attachment = {
      id: 'att-pdf-1',
      name: 'consigna.pdf',
      contentType: 'application/pdf',
      size: 20480, // 20 KB
    };

    render(
      <PrivateAttachmentView
        attachment={attachment}
        token="test-token"
        isOwn={false}
      />
    );

    expect(screen.getByText('consigna.pdf')).toBeInTheDocument();
    expect(screen.getByText('20.0 KB')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Descargar archivo consigna.pdf/i })).toBeInTheDocument();
  });

  it('rejects disallowed file types with an error notification', () => {
    const onError = vi.fn();
    const setDraftFiles = vi.fn();

    render(
      <PrivateAttachmentDraft
        draftFiles={[]}
        setDraftFiles={setDraftFiles}
        onError={onError}
        disabled={false}
      />
    );

    const input = document.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();

    const invalidFile = new File(['raw executable'], 'malware.exe', { type: 'application/x-msdownload' });
    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining('no está permitido')
    );
    expect(setDraftFiles).not.toHaveBeenCalled();
  });
});
