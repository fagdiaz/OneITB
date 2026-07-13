import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  FOLLOW_USER,
  GET_MY_FOLLOWED_USER_IDS,
  UNFOLLOW_USER,
} from '../../data/graphql/social';

const updateFollowCache = (cache, targetUserId, isFollowing) => {
  cache.updateQuery({ query: GET_MY_FOLLOWED_USER_IDS }, (current) => {
    if (!current) return current;
    const existing = current.myFollowedUserIds ?? [];
    const next = isFollowing
      ? [...new Set([...existing, targetUserId])]
      : existing.filter((id) => id !== targetUserId);
    return { ...current, myFollowedUserIds: next };
  });
};

export const FollowButton = ({
  targetUserId,
  isFollowing,
  onStateChange,
  onError,
  compact = false,
  className = '',
}) => {
  const [pending, setPending] = useState(false);
  const [followUser] = useMutation(FOLLOW_USER);
  const [unfollowUser] = useMutation(UNFOLLOW_USER);

  if (!targetUserId) return null;

  const handleToggle = async () => {
    if (pending) return;
    const nextState = !isFollowing;
    setPending(true);
    onStateChange?.(targetUserId, nextState);

    try {
      const mutate = nextState ? followUser : unfollowUser;
      const operationName = nextState ? 'followUser' : 'unfollowUser';
      const result = await mutate({
        variables: { targetUserId },
        optimisticResponse: {
          __typename: 'Mutation',
          [operationName]: {
            __typename: 'FollowStatePayload',
            targetUserId,
            isFollowing: nextState,
          },
        },
        update: (cache, mutationResult) => {
          const confirmed = mutationResult.data?.[operationName]?.isFollowing ?? nextState;
          updateFollowCache(cache, targetUserId, confirmed);
        },
      });
      onStateChange?.(targetUserId, result.data?.[operationName]?.isFollowing ?? nextState);
    } catch (error) {
      onStateChange?.(targetUserId, isFollowing);
      onError?.(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      aria-pressed={isFollowing}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
        compact ? 'px-2.5 py-1 text-[11px]' : 'px-4 py-2 text-sm'
      } ${
        isFollowing
          ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-300/20 dark:bg-blue-500/10 dark:text-blue-200'
          : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-blue-300/20'
      } ${className}`}
    >
      <i className={`fa-solid ${pending ? 'fa-spinner fa-spin' : isFollowing ? 'fa-user-check' : 'fa-user-plus'}`} />
      {isFollowing ? 'Siguiendo' : 'Seguir'}
    </button>
  );
};
