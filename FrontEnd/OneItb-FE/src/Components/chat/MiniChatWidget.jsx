import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApolloClient, useMutation, useQuery, useSubscription } from '@apollo/client';
import useAuth from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import {
  GET_CONVERSATION,
  GET_MESSAGING_CONTACTS,
  GET_ACTIVE_CONVERSATIONS,
  SEARCH_MY_MESSAGES,
  MARK_CONVERSATION_READ,
  MESSAGE_RECEIVED,
  SEND_MESSAGE,
} from '../../data/graphql/chat';
import { subscribeToGraphQLWsStatus } from '../../data/graphql/GraphqlProvider';

import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import {
  appendMessageToConversation,
  clearConversationUnread,
  updateContactCache,
} from './chatCache';

export const MiniChatWidget = () => {
  const { auth } = useAuth();
  const client = useApolloClient();
  const { form, changed, setForm } = useForm({ content: '' });
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [feedback, setFeedback] = useState('');
  const previousSocketStatus = useRef('disconnected');
  const mountedRef = useRef(true);
  const messageEndRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const searchInput = searchTerm.trim().toLowerCase();

  const {
    data: contactsData,
    loading: contactsLoading,
    error: contactsError,
    fetchMore: fetchMoreContacts,
    refetch: refetchContacts,
  } = useQuery(GET_MESSAGING_CONTACTS, {
    variables: { first: 50 },
    fetchPolicy: 'cache-and-network',
    skip: !isOpen,
  });

  const {
    data: activeData,
    loading: activeLoading,
    refetch: refetchActive,
  } = useQuery(GET_ACTIVE_CONVERSATIONS, {
    variables: { first: 50 },
    fetchPolicy: 'cache-and-network',
    skip: !isOpen,
  });

  const { data: searchMessagesData, loading: searchMessagesLoading } = useQuery(SEARCH_MY_MESSAGES, {
    variables: { searchTerm: searchInput, first: 20 },
    skip: searchInput.length < 2 || !isOpen,
    fetchPolicy: 'network-only',
  });

  const {
    data: conversationData,
    loading: conversationLoading,
    error: conversationError,
    fetchMore: fetchMoreMessages,
    refetch: refetchConversation,
  } = useQuery(GET_CONVERSATION, {
    variables: { otherUserId: selectedContactId, first: 50 },
    skip: !selectedContactId || !isOpen,
    fetchPolicy: 'cache-and-network',
  });

  const [markConversationRead] = useMutation(MARK_CONVERSATION_READ);
  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);
  
  const allContacts = useMemo(
    () => contactsData?.messagingContacts?.nodes || [],
    [contactsData],
  );
  const activeUsers = useMemo(
    () => activeData?.activeConversations?.nodes || [],
    [activeData],
  );
  
  const activeContacts = useMemo(() => activeUsers.map(dto => {
      const user = dto.contact;
      const contactInfo = allContacts.find(c => c.userId === user.id);
      return {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: contactInfo?.avatarUrl || user.avatarUrl,
        unreadCount: contactInfo?.unreadCount || 0,
        lastMessageAt: contactInfo?.lastMessageAt || null,
        lastMessageContent: dto.lastMessage || contactInfo?.lastMessageContent || null,
      };
    }),
    [activeUsers, allContacts],
  );

  const searchedMessages = useMemo(
    () => searchMessagesData?.searchMyMessages?.nodes || [],
    [searchMessagesData],
  );

  const selectedContact = useMemo(
    () => allContacts.find((contact) => contact.userId === selectedContactId)
      || activeContacts.find((contact) => contact.userId === selectedContactId),
    [allContacts, activeContacts, selectedContactId],
  );

  const messages = useMemo(
    () => [...(conversationData?.conversation?.nodes || [])].reverse(),
    [conversationData],
  );

  const totalUnreadCount = useMemo(() => {
    return allContacts.reduce((acc, contact) => acc + (contact.unreadCount || 0), 0);
  }, [allContacts]);

  useEffect(() => {
    mountedRef.current = true;
    const unsubscribe = subscribeToGraphQLWsStatus((status) => {
      if (mountedRef.current) setSocketStatus(status);
    });
    return () => {
      mountedRef.current = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  useEffect(() => {
    const wasUnavailable = ['disconnected', 'error'].includes(previousSocketStatus.current);
    if (socketStatus === 'connected' && wasUnavailable && isOpen) {
      refetchContacts();
      refetchActive();
      if (selectedContactId) refetchConversation();
    }
    previousSocketStatus.current = socketStatus;
  }, [socketStatus, selectedContactId, refetchContacts, refetchActive, refetchConversation, isOpen]);

  useEffect(() => {
    if (!selectedContactId || !isOpen) return;

    markConversationRead({
      variables: { otherUserId: selectedContactId },
      optimisticResponse: {
        __typename: 'Mutation',
        markConversationRead: {
          __typename: 'MarkConversationReadPayload',
          otherUserId: selectedContactId,
          markedCount: 0,
        },
      },
      update: (cache) => clearConversationUnread(cache, selectedContactId, auth.id),
    }).catch(() => {
      if (mountedRef.current) setFeedback('No se pudo actualizar el estado de lectura.');
    });
  }, [selectedContactId, auth.id, markConversationRead, isOpen]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const { error: subscriptionError } = useSubscription(MESSAGE_RECEIVED, {
    skip: !isOpen || !auth.id,
    onData: ({ data }) => {
      const message = data.data?.messageReceived;
      if (!message || !mountedRef.current) return;

      setTimeout(() => {
        if (!mountedRef.current) return;
      const otherUserId = message.senderId === auth.id ? message.receiverId : message.senderId;
      const isSelected = selectedContactId === otherUserId && isOpen;
      appendMessageToConversation(client.cache, otherUserId, message);
      updateContactCache(client.cache, otherUserId, message, auth.id, isSelected);

      const isActive = activeData?.activeConversations?.nodes?.some(u => u.contact.id === otherUserId);
      if (!isActive) {
        refetchActive().catch(() => {
          if (mountedRef.current) setFeedback('No se pudo actualizar la lista de conversaciones.');
        });
      }

      if (isSelected && message.receiverId === auth.id) {
        markConversationRead({
          variables: { otherUserId },
          update: (cache) => clearConversationUnread(cache, otherUserId, auth.id),
        }).catch(() => {
          if (mountedRef.current) setFeedback('El mensaje llegó, pero no se pudo marcar como leído.');
        });
      }
      }, 0);
    },
  });

  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);
    setFeedback('');
    setForm({ content: '' });
    setSearchTerm('');
  };

  const handleBackToContacts = () => {
    setSelectedContactId(null);
    setSearchTerm('');
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !selectedContactId) {
      // open
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = form.content?.trim();
    if (!selectedContactId || !content || sending) return;

    const optimisticId = `optimistic-${crypto.randomUUID()}`;
    const optimisticMessage = {
      __typename: 'Message',
      id: optimisticId,
      senderId: auth.id,
      receiverId: selectedContactId,
      content,
      sentAt: new Date().toISOString(),
      isRead: false,
      sender: {
        __typename: 'User',
        id: auth.id,
        firstName: auth.username || 'Yo',
        lastName: '',
        avatarUrl: auth.avatarUrl || null,
      },
      receiver: selectedContact ? {
        __typename: 'User',
        id: selectedContact.userId,
        firstName: selectedContact.firstName,
        lastName: selectedContact.lastName,
        avatarUrl: selectedContact.avatarUrl || null,
      } : null,
    };

    setForm({ content: '' });
    setFeedback('');

    try {
      await sendMessage({
        variables: { receiverId: selectedContactId, content },
        optimisticResponse: {
          __typename: 'Mutation',
          sendMessage: optimisticMessage,
        },
        update: (cache, { data }) => {
          const message = data?.sendMessage;
          if (!message) return;
          appendMessageToConversation(
            cache,
            selectedContactId,
            message,
            message.id === optimisticId ? undefined : optimisticId,
          );
          updateContactCache(cache, selectedContactId, message, auth.id, true);
        },
      });

      const isActive = activeData?.activeConversations?.nodes?.some(u => u.contact.id === selectedContactId);
      if (!isActive && mountedRef.current) {
        await refetchActive();
      }
    } catch (error) {
      if (mountedRef.current) {
        setForm({ content });
        setFeedback(error.message || 'No se pudo enviar el mensaje.');
      }
    }
  };

  const loadOlderMessages = () => {
    const pageInfo = conversationData?.conversation?.pageInfo;
    if (!pageInfo?.hasNextPage) return;

    fetchMoreMessages({
      variables: { after: pageInfo.endCursor },
      updateQuery: (previous, { fetchMoreResult }) => ({
        conversation: {
          ...fetchMoreResult.conversation,
          nodes: [
            ...(previous.conversation?.nodes || []),
            ...(fetchMoreResult.conversation?.nodes || []),
          ],
        },
      }),
    });
  };

  const { displayActive, displayNew } = useMemo(() => {
    if (!searchInput) {
      return {
        displayActive: [...activeContacts].sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)),
        displayNew: [],
      };
    }

    return {
      displayActive: activeContacts.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchInput) ||
        c.role?.toLowerCase().includes(searchInput)
      ).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)),
      displayNew: allContacts.filter(c =>
        !activeContacts.some(ac => ac.userId === c.userId) &&
        (`${c.firstName} ${c.lastName}`.toLowerCase().includes(searchInput) ||
        c.role?.toLowerCase().includes(searchInput))
      ),
    };
  }, [activeContacts, allContacts, searchInput]);

  return (
    <div className="fixed bottom-5 right-5 lg:right-80 z-50 flex flex-col items-end">
      {/* Widget Window */}
      {isOpen && (
        <div className="mb-3 flex h-[420px] w-[88vw] origin-bottom-right flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl ring-1 ring-slate-900/5 transition-all dark:border-white/10 dark:bg-slate-950/95 dark:shadow-[0_24px_70px_rgba(2,6,23,0.50)] dark:ring-blue-400/10 md:w-[560px]">
          
          <ChatSidebar 
            socketStatus={socketStatus}
            toggleWidget={toggleWidget}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            contactsLoading={contactsLoading}
            activeLoading={activeLoading}
            displayActive={displayActive}
            displayNew={displayNew}
            searchMessagesLoading={searchMessagesLoading}
            searchedMessages={searchedMessages}
            handleSelectContact={handleSelectContact}
            selectedContactId={selectedContactId}
            auth={auth}
            client={client}
          />

          <ChatWindow 
            selectedContact={selectedContact}
            selectedContactId={selectedContactId}
            toggleWidget={toggleWidget}
            handleBackToContacts={handleBackToContacts}
            conversationData={conversationData}
            conversationLoading={conversationLoading}
            messages={messages}
            loadOlderMessages={loadOlderMessages}
            messageEndRef={messageEndRef}
            feedback={feedback}
            subscriptionError={subscriptionError}
            handleSubmit={handleSubmit}
            form={form}
            changed={changed}
            sending={sending}
            auth={auth}
          />
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={toggleWidget}
        className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-300/20 bg-blue-600 text-white shadow-[0_18px_45px_rgba(37,99,235,0.35)] transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-[0_22px_55px_rgba(37,99,235,0.45)] active:scale-95"
        aria-label="Abrir chat"
      >
        <i className={`fa-solid fa-comment-dots text-xl transition duration-300 ${isOpen ? 'scale-0 opacity-0 absolute' : 'scale-100 opacity-100'}`}></i>
        <i className={`fa-solid fa-xmark text-xl transition duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 absolute'}`}></i>
        
        {totalUnreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold">
            {totalUnreadCount > 9 ? '+9' : totalUnreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
