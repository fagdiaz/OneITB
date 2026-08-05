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
import {
  appendMessageToConversation,
  clearConversationUnread,
  formatTime,
  updateContactCache,
} from './chatCache';
import { apiBaseUrl } from '../../utils/uploadFile';

const resolveAssetUrl = (value) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  if (value.startsWith('/')) return `${apiBaseUrl}${value}`;
  return value;
};

const getInitials = (firstName = '', lastName = '') =>
  `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';

const AvatarBadge = ({ person, className = 'h-10 w-10', fallbackClassName = '' }) => {
  const avatarUrl = resolveAssetUrl(person?.avatarUrl);
  const label = `${person?.firstName || ''} ${person?.lastName || ''}`.trim() || 'Usuario';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`Avatar de ${label}`}
        className={`${className} shrink-0 rounded-full object-cover ring-1 ring-white/15`}
      />
    );
  }

  return (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-full font-bold ring-1 ${fallbackClassName || 'bg-slate-100 text-blue-700 ring-slate-200 dark:bg-white/5 dark:text-blue-200 dark:ring-white/10'}`}>
      {getInitials(person?.firstName, person?.lastName)}
    </span>
  );
};

export const PrivateChat = () => {
  const { auth } = useAuth();
  const client = useApolloClient();
  const { form, changed, setForm } = useForm({ content: '' });
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
  });

  const {
    data: activeData,
    loading: activeLoading,
    refetch: refetchActive,
  } = useQuery(GET_ACTIVE_CONVERSATIONS, {
    variables: { first: 50 },
    fetchPolicy: 'cache-and-network',
  });

  const { data: searchMessagesData, loading: searchMessagesLoading } = useQuery(SEARCH_MY_MESSAGES, {
    variables: { searchTerm: searchInput, first: 20 },
    skip: searchInput.length < 2,
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
    skip: !selectedContactId,
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
  
  // Merge unreadCount from GET_MESSAGING_CONTACTS into activeUsers
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
    if (socketStatus === 'connected' && wasUnavailable) {
      refetchContacts();
      refetchActive();
      if (selectedContactId) refetchConversation();
    }
    previousSocketStatus.current = socketStatus;
  }, [socketStatus, selectedContactId, refetchContacts, refetchActive, refetchConversation]);

  useEffect(() => {
    if (!selectedContactId) return;

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
  }, [selectedContactId, auth.id, markConversationRead]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedContactId]);

  const { error: subscriptionError } = useSubscription(MESSAGE_RECEIVED, {
    onData: ({ data }) => {
      const message = data.data?.messageReceived;
      if (!message || !mountedRef.current) return;

      setTimeout(() => {
        if (!mountedRef.current) return;
      const otherUserId = message.senderId === auth.id ? message.receiverId : message.senderId;
      const isSelected = selectedContactId === otherUserId;
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

  const loadMoreContacts = () => {
    const pageInfo = contactsData?.messagingContacts?.pageInfo;
    if (!pageInfo?.hasNextPage) return;

    fetchMoreContacts({
      variables: { after: pageInfo.endCursor },
      updateQuery: (previous, { fetchMoreResult }) => ({
        messagingContacts: {
          ...fetchMoreResult.messagingContacts,
          nodes: [
            ...(previous.messagingContacts?.nodes || []),
            ...(fetchMoreResult.messagingContacts?.nodes || []),
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

  const renderContactItem = (contact, isNew = false) => {
    const active = contact.userId === selectedContactId;
    const preview = !isNew ? contact.lastMessageContent : null;
    const unread = (contact.unreadCount || 0) > 0 && !isNew;
    return (
      <button
        key={contact.userId}
        type="button"
        onClick={() => handleSelectContact(contact.userId)}
        className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-150 ${active ? 'border-blue-200 bg-blue-50 text-slate-950 shadow-[0_10px_30px_rgba(37,99,235,0.10)] dark:border-blue-300/20 dark:bg-blue-500/15 dark:text-white dark:shadow-[0_10px_30px_rgba(37,99,235,0.16)]' : unread ? 'border-blue-200 bg-blue-50/80 text-slate-950 shadow-sm dark:border-blue-300/20 dark:bg-blue-500/10 dark:text-white' : 'border-transparent text-slate-600 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/[0.05] dark:hover:text-white'}`}
      >
        <AvatarBadge
          person={contact}
          className="h-11 w-11"
          fallbackClassName={active || unread ? 'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-400/20 dark:text-blue-100 dark:ring-blue-300/20' : 'bg-slate-100 text-blue-700 ring-slate-200 group-hover:ring-blue-200 dark:bg-white/5 dark:text-blue-200 dark:ring-white/10 dark:group-hover:ring-blue-300/20'}
        />
        <div className="min-w-0 flex-1">
          <p className={`truncate ${unread ? 'font-black' : 'font-semibold'}`}>
            {contact.firstName} {contact.lastName} {isNew && <span className="ml-1 text-[10px] uppercase tracking-wider text-emerald-500 font-bold">(Nuevo)</span>}
          </p>
          <p className={`truncate text-xs ${active ? 'text-blue-700 dark:text-blue-100' : 'text-slate-500 dark:group-hover:text-slate-400'}`}>
            {preview ? `"${preview}"` : contact.role}
          </p>
        </div>
        {unread && (
          <span className={`min-w-6 rounded-full px-2 py-1 text-center text-xs font-bold ${active ? 'bg-blue-100 text-blue-700' : 'bg-blue-500 text-white'}`}>
            {contact.unreadCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <section className="h-[calc(100vh-4rem)] bg-slate-100 p-3 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:p-5">
      <div className="mx-auto flex h-full max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl ring-1 ring-slate-900/5 dark:border-white/10 dark:bg-slate-900/90 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)] dark:ring-blue-400/10">
        <aside className={`${selectedContactId ? 'hidden md:flex' : 'flex'} w-full flex-col border-r border-slate-200 bg-white/70 dark:border-white/10 dark:bg-slate-950/70 md:w-80`}>
          <div className="border-b border-slate-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Módulo 4</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Mensajes</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Conversaciones privadas de la comunidad.</p>
            
            <div className="mt-4 relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
              <input 
                type="text" 
                placeholder="Buscar usuarios o mensajes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-300/30 dark:focus:bg-slate-900 dark:focus:ring-blue-500/15"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {(contactsLoading || activeLoading) && displayActive.length === 0 && <p className="p-4 text-sm text-slate-500">Cargando...</p>}
            {(contactsError) && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                Error al cargar.
                <button type="button" onClick={() => { refetchContacts(); refetchActive(); }} className="ml-2 font-semibold underline">Reintentar</button>
              </div>
            )}
            
            {!contactsLoading && !activeLoading && !searchInput && displayActive.length === 0 && (
              <p className="p-4 text-sm text-slate-500">No tenés conversaciones activas. ¡Buscá un usuario para empezar!</p>
            )}

            <div className="space-y-4">
              {/* Prioridad 1: Conversaciones Activas */}
              {displayActive.length > 0 && (
                <div>
                  {searchInput && <h3 className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Conversaciones Activas</h3>}
                  <div className="space-y-1">
                    {displayActive.map(c => renderContactItem(c))}
                  </div>
                </div>
              )}

              {/* Prioridad 2: Nuevos Usuarios */}
              {searchInput && displayNew.length > 0 && (
                <div>
                  <h3 className="px-2 pb-2 pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">Nuevos Usuarios</h3>
                  <div className="space-y-1">
                    {displayNew.map(c => renderContactItem(c, true))}
                  </div>
                </div>
              )}

              {/* Prioridad 3: Mensajes */}
              {searchInput && searchInput.length >= 2 && (
                <div>
                  <h3 className="px-2 pb-2 pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">Mensajes</h3>
                  {searchMessagesLoading ? (
                    <p className="px-2 text-xs text-slate-500">Buscando mensajes...</p>
                  ) : searchedMessages.length > 0 ? (
                    <div className="space-y-2">
                      {searchedMessages.map(msg => {
                        const otherUser = msg.senderId === auth.id ? msg.receiver : msg.sender;
                        return (
                          <button 
                            key={msg.id}
                            onClick={() => handleSelectContact(otherUser.id)}
                            className="w-full rounded-xl bg-white p-3 text-left shadow-sm border border-slate-100 transition hover:border-blue-300"
                          >
                            <p className="text-xs font-bold text-slate-700">{otherUser.firstName} {otherUser.lastName}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">"{msg.content}"</p>
                            <p className="mt-1 text-[10px] text-slate-400">{formatTime(msg.sentAt)}</p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="px-2 text-xs text-slate-500">No se encontraron mensajes.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className={`${selectedContactId ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col bg-slate-50/70 dark:bg-slate-900/50`}>
          {!selectedContact ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-300/20 bg-blue-500/10 text-2xl text-blue-200 shadow-[0_16px_40px_rgba(37,99,235,0.16)]">
                <i className="fa-regular fa-comment-dots" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Elegí una conversación</h2>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                Seleccioná un usuario para consultar el historial y enviar mensajes privados.
              </p>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03] sm:px-6">
                <button type="button" onClick={() => setSelectedContactId(null)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white md:hidden" aria-label="Volver a contactos">
                  <i className="fa-solid fa-arrow-left" />
                </button>
                <AvatarBadge
                  person={selectedContact}
                  className="h-10 w-10"
                  fallbackClassName="bg-blue-500/15 text-blue-100 ring-blue-300/20"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-bold text-slate-950 dark:text-white">{selectedContact.firstName} {selectedContact.lastName}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedContact.role}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${socketStatus === 'connected' ? 'border-blue-300/20 bg-blue-500/10 text-blue-200' : 'border-amber-300/20 bg-amber-500/10 text-amber-200'}`}>
                  {socketStatus === 'connected' ? 'Tiempo real activo' : 'Reconectando...'}
                </span>
              </header>

              <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_34%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(241,245,249,0.98))] px-4 py-5 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_36%),linear-gradient(180deg,rgba(15,23,42,0.55),rgba(15,23,42,0.92))] sm:px-6">
                {conversationData?.conversation?.pageInfo?.hasNextPage && (
                  <div className="mb-4 text-center">
                    <button type="button" onClick={loadOlderMessages} className="rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-200 hover:bg-blue-500/15">Cargar mensajes anteriores</button>
                  </div>
                )}
                {conversationLoading && messages.length === 0 && <p className="text-center text-sm text-slate-500">Cargando conversación...</p>}
                {conversationError && (
                  <div className="mx-auto max-w-lg rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-center text-sm text-red-200">
                    No se pudo cargar la conversación.
                    <button type="button" onClick={() => refetchConversation()} className="ml-2 font-semibold text-red-100 underline">Reintentar</button>
                  </div>
                )}
                {!conversationLoading && !conversationError && messages.length === 0 && (
                  <p className="mt-10 text-center text-sm text-slate-500">Todavía no hay mensajes. Iniciá la conversación.</p>
                )}

                <div className="space-y-3">
                  {messages.map((message) => {
                    const isOwn = message.senderId === auth.id;
                    const isOptimistic = message.id.startsWith('optimistic-');
                    return (
                      <div key={message.id} className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {!isOwn && (
                          <AvatarBadge
                            person={message.sender || selectedContact}
                            className="h-8 w-8"
                            fallbackClassName="bg-slate-200 text-slate-700 ring-slate-300 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10"
                          />
                        )}
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-lg sm:max-w-[70%] ${isOwn ? 'rounded-br-md bg-blue-600 text-white shadow-blue-950/20' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100'} ${isOptimistic ? 'opacity-70' : ''}`}>
                          <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                          <p className={`mt-1 text-right text-[11px] ${isOwn ? 'text-blue-100' : 'text-slate-500'}`}>
                            {formatTime(message.sentAt)}{isOptimistic ? ' · Enviando' : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messageEndRef} />
                </div>
              </div>

              {(feedback || subscriptionError) && (
                <p className="border-t border-red-400/20 bg-red-500/10 px-5 py-2 text-sm text-red-200" role="alert">
                  {feedback || 'La conexión en tiempo real tuvo un problema. Se intentará reconectar.'}
                </p>
              )}

              <form onSubmit={handleSubmit} className="flex items-end gap-3 border-t border-slate-200 bg-white/90 p-3 dark:border-white/10 dark:bg-slate-950/80 sm:p-4">
                <textarea
                  name="content"
                  value={form.content}
                  onChange={changed}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  maxLength={2000}
                  rows={1}
                  placeholder="Escribí un mensaje..."
                  className="min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-300/30 dark:focus:ring-blue-500/15"
                />
                <button
                  type="submit"
                  disabled={!form.content?.trim() || sending}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Enviar mensaje"
                >
                  <i className="fa-solid fa-paper-plane" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
