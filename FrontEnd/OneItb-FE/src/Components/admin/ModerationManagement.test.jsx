import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModerationManagement } from './ModerationManagement';
import { GET_COMMUNITY_REPORTS } from '../../data/graphql/queries/admin';
import { UPDATE_REPORT_STATUS } from '../../data/graphql/mutations/moderation';

describe('ModerationManagement (WALL-C)', () => {
  it('renders reported publications and comments and updates status', async () => {
    const report1Id = '11111111-1111-1111-1111-111111111111';
    const report2Id = '22222222-2222-2222-2222-222222222222';

    const updateMock = vi.fn().mockReturnValue({
      data: {
        updateReportStatus: {
          __typename: 'CommunityReport',
          id: report2Id,
          status: 'Resolved',
        },
      },
    });

    const mocks = [
      {
        request: {
          query: GET_COMMUNITY_REPORTS,
        },
        result: {
          data: {
            communityReports: [
              {
                __typename: 'CommunityReport',
                id: report1Id,
                commentId: null,
                reason: 'Spam en publicación',
                status: 'Pending',
                createdAt: '2026-11-08T20:00:00Z',
                reporter: {
                  __typename: 'User',
                  id: '33333333-3333-3333-3333-333333333333',
                  firstName: 'Carlos',
                  lastName: 'Pérez',
                },
                inquiry: {
                  __typename: 'Inquiry',
                  id: '44444444-4444-4444-4444-444444444444',
                  title: 'Publicación sobre finales',
                },
                comment: null,
              },
              {
                __typename: 'CommunityReport',
                id: report2Id,
                commentId: '55555555-5555-5555-5555-555555555555',
                reason: 'Insultos en comentario',
                status: 'Pending',
                createdAt: '2026-11-08T20:05:00Z',
                reporter: {
                  __typename: 'User',
                  id: '66666666-6666-6666-6666-666666666666',
                  firstName: 'María',
                  lastName: 'Gómez',
                },
                inquiry: {
                  __typename: 'Inquiry',
                  id: '44444444-4444-4444-4444-444444444444',
                  title: 'Publicación sobre finales',
                },
                comment: {
                  __typename: 'Comment',
                  id: '55555555-5555-5555-5555-555555555555',
                  content: 'Comentario agresivo que fue reportado',
                  user: {
                    __typename: 'User',
                    id: '77777777-7777-7777-7777-777777777777',
                    firstName: 'Juan',
                    lastName: 'Infractor',
                  },
                },
              },
            ],
          },
        },
      },
      {
        request: {
          query: UPDATE_REPORT_STATUS,
          variables: {
            reportId: report2Id,
            status: 'Resolved',
          },
        },
        result: updateMock,
      },
      {
        request: {
          query: GET_COMMUNITY_REPORTS,
        },
        result: {
          data: {
            communityReports: [
              {
                __typename: 'CommunityReport',
                id: report1Id,
                commentId: null,
                reason: 'Spam en publicación',
                status: 'Pending',
                createdAt: '2026-11-08T20:00:00Z',
                reporter: {
                  __typename: 'User',
                  id: '33333333-3333-3333-3333-333333333333',
                  firstName: 'Carlos',
                  lastName: 'Pérez',
                },
                inquiry: {
                  __typename: 'Inquiry',
                  id: '44444444-4444-4444-4444-444444444444',
                  title: 'Publicación sobre finales',
                },
                comment: null,
              },
            ],
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <ModerationManagement />
      </MockedProvider>
    );

    expect(await screen.findByText('Moderacion y reportes')).toBeInTheDocument();
    expect(screen.getByText('Publicación sobre finales')).toBeInTheDocument();
    expect(screen.getByText('Comentario')).toBeInTheDocument();
    expect(screen.getByText(/Comentario agresivo que fue reportado/)).toBeInTheDocument();
    expect(screen.getByText(/autor: Juan Infractor/)).toBeInTheDocument();

    const resolveButtons = screen.getAllByRole('button', { name: 'Resolver' });
    expect(resolveButtons.length).toBe(2);
    fireEvent.click(resolveButtons[1]);

    await waitFor(() => expect(updateMock).toHaveBeenCalledOnce());
  });
});
