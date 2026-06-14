import { gql } from '@apollo/client';

export const GET_MESSAGING_CONTACTS = gql`
  query MessagingContacts($first: Int, $after: String) {
    messagingContacts(first: $first, after: $after) {
      nodes {
        userId
        firstName
        lastName
        role
        lastMessageAt
        unreadCount
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_CONVERSATION = gql`
  query Conversation($otherUserId: UUID!, $first: Int, $after: String) {
    conversation(otherUserId: $otherUserId, first: $first, after: $after) {
      nodes {
        id
        senderId
        receiverId
        content
        sentAt
        isRead
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($receiverId: UUID!, $content: String!) {
    sendMessage(receiverId: $receiverId, content: $content) {
      id
      senderId
      receiverId
      content
      sentAt
      isRead
    }
  }
`;

export const MARK_CONVERSATION_READ = gql`
  mutation MarkConversationRead($otherUserId: UUID!) {
    markConversationRead(otherUserId: $otherUserId) {
      otherUserId
      markedCount
    }
  }
`;

export const MESSAGE_RECEIVED = gql`
  subscription MessageReceived {
    messageReceived {
      id
      senderId
      receiverId
      content
      sentAt
      isRead
    }
  }
`;

export const GET_ACTIVE_CONVERSATIONS = gql`
  query ActiveConversations($first: Int, $after: String) {
    activeConversations(first: $first, after: $after) {
      nodes {
        id
        firstName
        lastName
        role
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const SEARCH_MY_MESSAGES = gql`
  query SearchMyMessages($searchTerm: String!, $first: Int, $after: String) {
    searchMyMessages(searchTerm: $searchTerm, first: $first, after: $after) {
      nodes {
        id
        senderId
        receiverId
        content
        sentAt
        sender {
          id
          firstName
          lastName
        }
        receiver {
          id
          firstName
          lastName
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
