import { gql } from '@apollo/client';

export const GET_MY_FOLLOWED_USER_IDS = gql`
  query GetMyFollowedUserIds {
    myFollowedUserIds
  }
`;

export const FOLLOW_USER = gql`
  mutation FollowUser($targetUserId: UUID!) {
    followUser(targetUserId: $targetUserId) {
      targetUserId
      isFollowing
    }
  }
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($targetUserId: UUID!) {
    unfollowUser(targetUserId: $targetUserId) {
      targetUserId
      isFollowing
    }
  }
`;
