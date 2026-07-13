import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FOLLOW_USER } from '../../data/graphql/social';
import { FollowButton } from './FollowButton';

const targetUserId = '22222222-2222-2222-2222-222222222222';

describe('FollowButton', () => {
  it('updates optimistically and confirms the follow state', async () => {
    const onStateChange = vi.fn();
    render(
      <MockedProvider mocks={[{
        request: { query: FOLLOW_USER, variables: { targetUserId } },
        result: { data: { followUser: { __typename: 'FollowStatePayload', targetUserId, isFollowing: true } } },
      }]}>
        <FollowButton targetUserId={targetUserId} isFollowing={false} onStateChange={onStateChange} />
      </MockedProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /seguir/i }));

    expect(onStateChange).toHaveBeenCalledWith(targetUserId, true);
    await waitFor(() => expect(onStateChange).toHaveBeenCalledTimes(2));
  });
});
