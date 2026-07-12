import { gql } from '@apollo/client';

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications($first: Int!) {
    myNotifications(first: $first) {
      id
      type
      message
      actionUrl
      isRead
      createdAt
      updatedAt
      aggregateCount
      relatedInquiryId
    }
  }
`;

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query GetUnreadNotificationCount {
    unreadNotificationCount
  }
`;

export const GET_MY_NOTIFICATION_PREFERENCES = gql`
  query GetMyNotificationPreferences {
    myNotificationPreferences {
      id
      type
      isEnabled
      updatedAt
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($notificationId: UUID!) {
    markNotificationRead(notificationId: $notificationId) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

export const UPDATE_NOTIFICATION_PREFERENCE = gql`
  mutation UpdateNotificationPreference($type: NotificationType!, $isEnabled: Boolean!) {
    updateNotificationPreference(type: $type, isEnabled: $isEnabled) {
      id
      type
      isEnabled
      updatedAt
    }
  }
`;

export const NOTIFICATION_RECEIVED = gql`
  subscription NotificationReceived {
    notificationReceived {
      id
      type
      message
      actionUrl
      isRead
      createdAt
      updatedAt
      aggregateCount
      relatedInquiryId
    }
  }
`;
