import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { CommentThread } from './CommentThread';

const rootId = '10000000-0000-0000-0000-000000000001';
const replyId = '10000000-0000-0000-0000-000000000002';
const comments = [
  {
    id: rootId,
    inquiryId: '20000000-0000-0000-0000-000000000001',
    userId: '30000000-0000-0000-0000-000000000001',
    parentCommentId: null,
    content: 'Comentario raiz',
    createdAt: '2026-07-12T10:00:00Z',
    user: { id: '30000000-0000-0000-0000-000000000001', firstName: 'Ana', lastName: 'Alumna', role: 'Estudiante' },
  },
  {
    id: replyId,
    inquiryId: '20000000-0000-0000-0000-000000000001',
    userId: '30000000-0000-0000-0000-000000000002',
    parentCommentId: rootId,
    content: 'Respuesta existente',
    createdAt: '2026-07-12T10:01:00Z',
    user: { id: '30000000-0000-0000-0000-000000000002', firstName: 'Beto', lastName: 'Docente', role: 'Profesor' },
  },
];

const renderThread = (overrides = {}) => render(
  <MockedProvider>
    <MemoryRouter>
      <CommentThread
        comments={comments}
        onComment={vi.fn()}
        onToggleReaction={vi.fn()}
        onEditComment={vi.fn()}
        onToggleComment={vi.fn()}
        onModerateComment={vi.fn()}
        auth={{ id: '40000000-0000-0000-0000-000000000001' }}
        {...overrides}
      />
    </MemoryRouter>
  </MockedProvider>,
);

describe('CommentThread', () => {
  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('replies to a second-level comment as a root sibling with a mention target', async () => {
    const onComment = vi.fn().mockResolvedValue(undefined);
    renderThread({ onComment });

    fireEvent.click(screen.getByRole('button', { name: 'Responder a Beto' }));
    const input = screen.getByPlaceholderText('Escribe una respuesta...');
    expect(input).toHaveValue('@Beto ');
    fireEvent.change(input, { target: { value: '@Beto Gracias por el aporte' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => expect(onComment).toHaveBeenCalledWith(
      rootId,
      '@Beto Gracias por el aporte',
      [],
      replyId,
    ));
  });

  it('marks a deep-linked comment as the navigation target', () => {
    renderThread({ targetCommentId: replyId });
    const target = document.getElementById(`comment-${replyId}`);
    expect(target).toHaveClass('ring-2');
  });
});
