import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReportModal } from '../moderation/ReportModal';
import { REPORT_COMMENT, REPORT_INQUIRY } from '../../data/graphql/mutations/moderation';

describe('Comment and Inquiry Reporting (WALL-A / WALL-C)', () => {
  it('renders comment report modal and submits reportComment mutation', async () => {
    const commentId = '55555555-5555-5555-5555-555555555555';
    const onReported = vi.fn();
    const onClose = vi.fn();

    const mocks = [
      {
        request: {
          query: REPORT_COMMENT,
          variables: {
            commentId,
            reason: 'Lenguaje inapropiado y spam',
          },
        },
        result: {
          data: {
            reportComment: {
              __typename: 'CommentReportReceipt',
              id: '99999999-9999-9999-9999-999999999999',
              inquiryId: '11111111-1111-1111-1111-111111111111',
              commentId,
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <ReportModal
          isOpen={true}
          commentId={commentId}
          targetKind="comment"
          onClose={onClose}
          onReported={onReported}
        />
      </MockedProvider>
    );

    expect(screen.getByRole('heading', { name: 'Reportar comentario' })).toBeInTheDocument();
    expect(screen.getByText('El equipo de moderación revisará el motivo y el comentario.')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText('Describí el problema...');
    fireEvent.change(textarea, { target: { value: 'Lenguaje inapropiado y spam' } });

    const submitBtn = screen.getByRole('button', { name: 'Enviar reporte' });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(onReported).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders inquiry report modal and submits reportInquiry mutation', async () => {
    const inquiryId = '11111111-1111-1111-1111-111111111111';
    const onReported = vi.fn();
    const onClose = vi.fn();

    const mocks = [
      {
        request: {
          query: REPORT_INQUIRY,
          variables: {
            inquiryId,
            reason: 'Contenido repetido',
          },
        },
        result: {
          data: {
            reportInquiry: {
              __typename: 'CommunityReport',
              id: '88888888-8888-8888-8888-888888888888',
              inquiryId,
              reporterId: '22222222-2222-2222-2222-222222222222',
              status: 'Pending',
              createdAt: '2026-11-08T22:00:00Z',
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <ReportModal
          isOpen={true}
          inquiryId={inquiryId}
          targetKind="inquiry"
          onClose={onClose}
          onReported={onReported}
        />
      </MockedProvider>
    );

    expect(screen.getByRole('heading', { name: 'Reportar publicación' })).toBeInTheDocument();
    expect(screen.getByText('El equipo de moderación revisará el motivo y la publicación.')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText('Describí el problema...');
    fireEvent.change(textarea, { target: { value: 'Contenido repetido' } });

    const submitBtn = screen.getByRole('button', { name: 'Enviar reporte' });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(onReported).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes on Escape key without submitting', () => {
    const onClose = vi.fn();
    render(
      <MockedProvider>
        <ReportModal
          isOpen={true}
          commentId="55555555-5555-5555-5555-555555555555"
          targetKind="comment"
          onClose={onClose}
        />
      </MockedProvider>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
