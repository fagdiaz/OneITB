import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GET_MY_NOTIFICATION_PREFERENCES, UPDATE_NOTIFICATION_PREFERENCE } from '../../data/graphql/notifications';
import { NotificationPreferencesModal } from './NotificationPreferencesModal';

describe('NotificationPreferencesModal', () => {
  it('renders server preferences and persists a switch change', async () => {
    const preference = {
      __typename: 'NotificationPreference',
      id: 'preference-1',
      type: 'PRIVATE_MESSAGE',
      isEnabled: true,
      updatedAt: '2026-07-12T12:00:00Z',
    };
    const mocks = [
      {
        request: { query: GET_MY_NOTIFICATION_PREFERENCES },
        result: { data: { myNotificationPreferences: [preference] } },
      },
      {
        request: { query: UPDATE_NOTIFICATION_PREFERENCE, variables: { type: 'PRIVATE_MESSAGE', isEnabled: false } },
        result: { data: { updateNotificationPreference: { ...preference, isEnabled: false, updatedAt: '2026-07-12T12:01:00Z' } } },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename>
        <NotificationPreferencesModal isOpen onClose={vi.fn()} />
      </MockedProvider>,
    );

    const toggle = await screen.findByRole('switch', { name: /mensajes privados/i });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(toggle);
    expect(await screen.findByText('Desactivadas')).toBeInTheDocument();
  });

  it('closes when the backdrop is selected', () => {
    const onClose = vi.fn();
    render(
      <MockedProvider>
        <NotificationPreferencesModal isOpen onClose={onClose} />
      </MockedProvider>,
    );

    fireEvent.mouseDown(screen.getByRole('presentation'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders as a compact right-side drawer instead of a centered modal', () => {
    render(
      <MockedProvider>
        <NotificationPreferencesModal isOpen onClose={vi.fn()} />
      </MockedProvider>,
    );

    expect(screen.getByRole('dialog')).toHaveClass('ml-auto', 'h-full');
    expect(screen.getByRole('presentation')).not.toHaveClass('items-center', 'justify-center');
  });
});
