import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import useAuth from '../../hooks/useAuth';
import {
  GET_MY_NOTIFICATION_PREFERENCES,
  GET_MY_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATION_COUNT,
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
  NOTIFICATION_RECEIVED,
  UPDATE_NOTIFICATION_PREFERENCE,
} from '../../data/graphql/notifications';

const notificationLabels = {
  ACADEMIC_RESOURCE: 'Recursos',
  ACADEMIC_PROGRESS: 'Progreso',
  SIU_SYNC: 'SIU',
};

const notificationIcons = {
  ACADEMIC_RESOURCE: 'fa-solid fa-book-open',
  ACADEMIC_PROGRESS: 'fa-solid fa-chart-line',
  SIU_SYNC: 'fa-solid fa-arrows-rotate',
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

  const {
    data: preferencesData,
    refetch: refetchPreferences,
  } = useQuery(GET_MY_NOTIFICATION_PREFERENCES, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const { data: subscriptionData } = useSubscription(NOTIFICATION_RECEIVED, {
    skip: !isAuthenticated,
  });

  const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllNotificationsRead, { loading: markingAllRead }] = useMutation(MARK_ALL_NOTIFICATIONS_READ);
  const [updateNotificationPreference, { loading: updatingPreference }] = useMutation(UPDATE_NOTIFICATION_PREFERENCE);

  const notifications = notificationsData?.myNotifications ?? [];
  const unreadCount = unreadData?.unreadNotificationCount ?? 0;
  const preferences = useMemo(
    () => preferencesData?.myNotificationPreferences ?? [],
    [preferencesData],
  );

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
    await Promise.all([refetchNotifications(), refetchUnreadCount(), refetchPreferences()]);
  };

  const handleOpen = () => {
    setIsOpen((current) => !current);
  };

  const handleMarkRead = async (notificationId) => {
    try {
      setActionError(null);
      await markNotificationRead({ variables: { notificationId } });
      await refresh();
    } catch (error) {
      setActionError(error.message || 'No se pudo actualizar la notificacion.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setActionError(null);
      await markAllNotificationsRead();
      await refresh();
    } catch (error) {
      setActionError(error.message || 'No se pudieron marcar las notificaciones.');
    }
  };

  const handlePreferenceChange = async (type, isEnabled) => {
    try {
      setActionError(null);
      await updateNotificationPreference({ variables: { type, isEnabled } });
      await refetchPreferences();
    } catch (error) {
      setActionError(error.message || 'No se pudo actualizar la preferencia.');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-slate-300 transition-all duration-150 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/10 hover:text-white hover:shadow-[0_4px_14px_rgba(59,130,246,0.35)] focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label="Notificaciones"
      >
        <i className="fa-regular fa-bell text-base" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[1.15rem] rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-[80] w-[22rem] max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 text-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.45)] backdrop-blur-xl ring-1 ring-blue-400/10">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
            <div>
              <p className="text-sm font-bold text-white">Notificaciones</p>
              <p className="text-xs text-slate-400">{unreadCount} sin leer</p>
            </div>
            <button
              type="button"
              disabled={markingAllRead || unreadCount === 0}
              onClick={handleMarkAllRead}
              className="rounded-lg border border-transparent px-2 py-1 text-xs font-semibold text-blue-300 transition hover:border-blue-300/20 hover:bg-blue-400/10 hover:text-blue-100 disabled:cursor-not-allowed disabled:text-slate-600"
            >
              Marcar leidas
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {actionError && (
              <div className="border-b border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200">
                {actionError}
              </div>
            )}
            {notificationsLoading ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400">Cargando...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400">No tenes notificaciones.</div>
            ) : (
              notifications.map((notification) => {
                const content = (
                  <div className="flex gap-3 px-4 py-3 transition hover:bg-white/[0.04]">
                    <span
                      className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        notification.isRead ? 'bg-white/5 text-slate-500' : 'bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20'
                      }`}
                    >
                      <i className={notificationIcons[notification.type] ?? 'fa-regular fa-bell'} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-300">
                          {notificationLabels[notification.type] ?? notification.type}
                        </span>
                        {!notification.isRead && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                      </span>
                      <span className="mt-1 block text-sm font-medium text-slate-100">{notification.message}</span>
                      <span className="mt-1 block text-xs text-slate-500">{formatNotificationDate(notification.createdAt)}</span>
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
                    className="block border-b border-white/10 last:border-0"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleMarkRead(notification.id)}
                    className="block w-full border-b border-white/10 text-left last:border-0"
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Preferencias</p>
            <div className="mt-2 grid gap-2">
              {preferences.map((preference) => (
                <label key={preference.id} className="flex items-center justify-between text-xs text-slate-300">
                  <span>{notificationLabels[preference.type] ?? preference.type}</span>
                  <input
                    type="checkbox"
                    checked={preference.isEnabled}
                    disabled={updatingPreference}
                    onChange={(event) => handlePreferenceChange(preference.type, event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-400"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
