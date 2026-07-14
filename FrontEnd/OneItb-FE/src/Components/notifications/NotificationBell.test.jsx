import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthContext } from '../../context/AuthContext';
import {
  GET_MY_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATION_COUNT,
  MARK_NOTIFICATION_READ,
} from '../../data/graphql/notifications';
import { NotificationBell } from './NotificationBell';

describe('NotificationBell', () => {
  it('uses unread records for the badge instead of the grouped historical count', async () => {
    const notification = {
      __typename: 'Notification',
      id: '79faaf2f-50d2-4553-a0f6-49860c513675',
      type: 'SOCIAL_COMMENT',
      message: 'Tu publicacion recibio 2 comentarios.',
      actionUrl: '/feed?inquiryId=one',
      isRead: false,
      createdAt: '2026-07-13T12:00:00Z',
      updatedAt: '2026-07-13T12:10:00Z',
      aggregateCount: 2,
      relatedInquiryId: null,
    };
    const mocks = [
      {
        request: { query: GET_MY_NOTIFICATIONS, variables: { first: 10 } },
        result: { data: { myNotifications: [notification] } },
      },
      {
        request: { query: GET_UNREAD_NOTIFICATION_COUNT },
        result: { data: { unreadNotificationCount: 1 } },
      },
      {
        request: { query: MARK_NOTIFICATION_READ, variables: { notificationId: notification.id } },
        result: { data: { markNotificationRead: { __typename: 'Notification', id: notification.id, isRead: true } } },
      },
      {
        request: { query: GET_MY_NOTIFICATIONS, variables: { first: 10 } },
        result: { data: { myNotifications: [{ ...notification, isRead: true }] } },
      },
      {
        request: { query: GET_UNREAD_NOTIFICATION_COUNT },
        result: { data: { unreadNotificationCount: 0 } },
      },
    ];

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ auth: { id: 'user-1' } }}>
          <MockedProvider mocks={mocks} addTypename>
            <NotificationBell />
          </MockedProvider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    const bell = screen.getByRole('button', { name: 'Notificaciones' });
    expect(await screen.findByText('1')).toBeInTheDocument();
    fireEvent.click(bell);
    expect(await screen.findByText('Tu publicacion recibio 2 comentarios.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link'));
    await waitFor(() => expect(screen.queryByText('1')).not.toBeInTheDocument());
  });
});
