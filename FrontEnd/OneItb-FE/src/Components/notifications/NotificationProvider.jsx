import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '@apollo/client';
import useAuth from '../../hooks/useAuth';
import { NOTIFICATION_RECEIVED } from '../../data/graphql/notifications';

const toastIcons = {
  ACADEMIC_RESOURCE: 'fa-solid fa-book-open',
  ACADEMIC_PROGRESS: 'fa-solid fa-chart-line',
  SIU_SYNC: 'fa-solid fa-arrows-rotate',
};

export const NotificationProvider = ({ children }) => {
  const { auth } = useAuth();
  const isAuthenticated = Boolean(auth.id);
  const [toasts, setToasts] = useState([]);
  const seenIdsRef = useRef(new Set());
  const timersRef = useRef(new Map());
  const activeUserIdRef = useRef(null);
  const { data } = useSubscription(NOTIFICATION_RECEIVED, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    const userChanged = activeUserIdRef.current !== (auth.id ?? null);
    if (!isAuthenticated || userChanged) {
      setToasts([]);
      seenIdsRef.current.clear();
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current.clear();
      activeUserIdRef.current = auth.id ?? null;
    }
  }, [isAuthenticated, auth.id]);

  useEffect(() => () => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current.clear();
  }, []);

  useEffect(() => {
    const notification = data?.notificationReceived;
    if (!notification || seenIdsRef.current.has(notification.id)) return;

    seenIdsRef.current.add(notification.id);
    setToasts((current) => [notification, ...current].slice(0, 4));

    const timerId = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== notification.id));
      timersRef.current.delete(notification.id);
    }, 6500);
    timersRef.current.set(notification.id, timerId);
  }, [data]);

  const dismissToast = (id) => {
    const timerId = timersRef.current.get(id);
    if (timerId) window.clearTimeout(timerId);
    timersRef.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {children}
      {isAuthenticated && toasts.length > 0 && (
        <div className="pointer-events-none fixed right-4 top-20 z-[120] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 print:hidden">
          {toasts.map((toast) => {
            const content = (
              <div className="flex gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                  <i className={toastIcons[toast.type] ?? 'fa-regular fa-bell'} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">Notificacion</span>
                  <span className="mt-1 block text-sm font-semibold text-slate-900 dark:text-white">{toast.message}</span>
                </span>
              </div>
            );

            return (
              <div
                key={toast.id}
                className="pointer-events-auto overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-4 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 dark:text-slate-100 dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
              >
                <div className="flex items-start gap-3">
                  {toast.actionUrl ? (
                    <Link to={toast.actionUrl} onClick={() => dismissToast(toast.id)} className="min-w-0 flex-1">
                      {content}
                    </Link>
                  ) : (
                    <div className="min-w-0 flex-1">{content}</div>
                  )}
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label="Cerrar notificacion"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
