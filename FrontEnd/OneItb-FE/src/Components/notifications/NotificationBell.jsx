import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import useAuth from '../../hooks/useAuth';
import {
  GET_MY_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATION_COUNT,
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
  NOTIFICATION_RECEIVED,
} from '../../data/graphql/notifications';
import { NotificationPreferencesModal } from './NotificationPreferencesModal';

const notificationLabels = {
  ACADEMIC_RESOURCE: 'Recursos',
  ACADEMIC_PROGRESS: 'Progreso',
  SIU_SYNC: 'SIU',
  SOCIAL_COMMENT: 'Comentarios',
  SOCIAL_REACTION: 'Me gusta',
  PRIVATE_MESSAGE: 'Mensajes',
};

const notificationIcons = {
  ACADEMIC_RESOURCE: 'fa-solid fa-book-open',
  ACADEMIC_PROGRESS: 'fa-solid fa-chart-line',
  SIU_SYNC: 'fa-solid fa-arrows-rotate',
  SOCIAL_COMMENT: 'fa-regular fa-comment-dots',
  SOCIAL_REACTION: 'fa-regular fa-thumbs-up',
  PRIVATE_MESSAGE: 'fa-regular fa-comment-dots',
};

const formatNotificationDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

export const NotificationBell = () => {
  const { auth } = useAuth();
  const isAuthenticated = Boolean(auth.id);
  const [isOpen, setIsOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [actionError, setActionError] = useState(null);
  const dropdownRef = useRef(null);

  const {
    data: notificationsData,
    loading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery(GET_MY_NOTIFICATIONS, {
    variables: { first: 10 },
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: unreadData,
    refetch: refetchUnreadCount,
  } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const { data: subscriptionData } = useSubscription(NOTIFICATION_RECEIVED, {
    skip: !isAuthenticated,
  });

  const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllNotificationsRead, { loading: markingAllRead }] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  const notifications = notificationsData?.myNotifications ?? [];
  const unreadCount = unreadData?.unreadNotificationCount ?? 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!subscriptionData?.notificationReceived) return;
    refetchNotifications();
    refetchUnreadCount();
  }, [subscriptionData, refetchNotifications, refetchUnreadCount]);

  const refresh = async () => {
    await Promise.all([refetchNotifications(), refetchUnreadCount()]);
  };

  const handleOpen = () => {
    setIsOpen((current) => !current);
  };

  const handleMarkRead = async (notificationId) => {
    try {
      setActionError(null);
      const notification = notifications.find((item) => item.id === notificationId);
      await markNotificationRead({
        variables: { notificationId },
        optimisticResponse: {
          markNotificationRead: { __typename: 'Notification', id: notificationId, isRead: true },
        },
        update: (cache) => {
          if (notification?.isRead) return;
          cache.writeQuery({
            query: GET_UNREAD_NOTIFICATION_COUNT,
            data: { unreadNotificationCount: Math.max(0, unreadCount - 1) },
          });
        },
      });
      await refresh();
    } catch (error) {
      setActionError(error.message || 'No se pudo actualizar la notificacion.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setActionError(null);
      await markAllNotificationsRead({
        optimisticResponse: { markAllNotificationsRead: unreadCount },
        update: (cache) => {
          cache.writeQuery({ query: GET_UNREAD_NOTIFICATION_COUNT, data: { unreadNotificationCount: 0 } });
        },
      });
      await refresh();
    } catch (error) {
      setActionError(error.message || 'No se pudieron marcar las notificaciones.');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleOpen}
        className={[
          'relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-150',
          'hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/10 hover:text-white',
          'hover:shadow-[0_4px_14px_rgba(59,130,246,0.35)]',
          isOpen
            ? 'border-blue-300/30 bg-white/10 text-white ring-1 ring-blue-300/20 shadow-[0_4px_14px_rgba(59,130,246,0.34)]'
            : 'border-transparent text-slate-300',
        ].join(' ')}
        aria-label="Notificaciones"
        aria-expanded={isOpen}
      >
        <i className="fa-regular fa-bell text-base" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[1.15rem] rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-[80] w-[22rem] max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white/95 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-xl ring-1 ring-slate-900/5 dark:border-white/10 dark:bg-slate-800/96 dark:text-slate-100 dark:shadow-[0_24px_70px_rgba(15,23,42,0.36)] dark:ring-blue-400/10">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <div>
              <p className="text-sm font-bold text-slate-950 dark:text-white">Notificaciones</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} sin leer</p>
            </div>
            <button
              type="button"
              disabled={markingAllRead || unreadCount === 0}
              onClick={handleMarkAllRead}
              className="rounded-lg border border-transparent px-2 py-1 text-xs font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-slate-400 dark:text-blue-300 dark:hover:border-blue-300/20 dark:hover:bg-blue-400/10 dark:hover:text-blue-100 dark:disabled:text-slate-600"
            >
              Marcar leidas
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {actionError && (
              <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
                {actionError}
              </div>
            )}
            {notificationsLoading ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">Cargando...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">No tenes notificaciones.</div>
            ) : (
              notifications.map((notification) => {
                const content = (
                  <div className="flex gap-3 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                    <span
                      className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        notification.isRead ? 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-300/20'
                      }`}
                    >
                      <i className={notificationIcons[notification.type] ?? 'fa-regular fa-bell'} />
                      {(notification.aggregateCount ?? 1) > 1 && (
                        <span className="sr-only">{notification.aggregateCount} eventos agrupados</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-white/10 dark:text-slate-300">
                          {notificationLabels[notification.type] ?? notification.type}
                        </span>
                        {!notification.isRead && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                      </span>
                      <span className="mt-1 block text-sm font-medium text-slate-800 dark:text-slate-100">{notification.message}</span>
                      <span className="mt-1 block text-xs text-slate-500">{formatNotificationDate(notification.updatedAt || notification.createdAt)}</span>
                    </span>
                  </div>
                );

                return notification.actionUrl ? (
                  <Link
                    key={notification.id}
                    to={notification.actionUrl}
                    onClick={() => {
                      handleMarkRead(notification.id);
                      setIsOpen(false);
                    }}
                    className="block border-b border-slate-100 last:border-0 dark:border-white/10"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleMarkRead(notification.id)}
                    className="block w-full border-b border-slate-100 text-left last:border-0 dark:border-white/10"
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setPreferencesOpen(true);
              }}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-white/10 dark:bg-slate-700 dark:text-slate-200 dark:hover:border-blue-300/20 dark:hover:bg-blue-500/10"
            >
              <span><i className="fa-solid fa-sliders mr-2 text-blue-500" />Configurar notificaciones</span>
              <i className="fa-solid fa-chevron-right text-[10px] text-slate-400" />
            </button>
          </div>
        </div>
      )}
      <NotificationPreferencesModal isOpen={preferencesOpen} onClose={() => setPreferencesOpen(false)} />
    </div>
  );
};
