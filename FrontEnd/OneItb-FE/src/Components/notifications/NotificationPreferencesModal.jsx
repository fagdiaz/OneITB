import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery } from '@apollo/client';
import { GET_MY_NOTIFICATION_PREFERENCES, UPDATE_NOTIFICATION_PREFERENCE } from '../../data/graphql/notifications';

const labels = {
  ACADEMIC_RESOURCE: 'Recursos académicos', ACADEMIC_PROGRESS: 'Progreso y calificaciones',
  SIU_SYNC: 'Sincronización SIU', JOB_OFFER: 'Ofertas de empleo', JOB_APPLICATION: 'Postulaciones',
  SOCIAL_COMMENT: 'Comentarios', SOCIAL_REACTION: 'Me gusta', PRIVATE_MESSAGE: 'Mensajes privados',
};

export const NotificationPreferencesModal = ({ isOpen, onClose }) => {
  const titleId = useId();
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const pendingTypeRef = useRef(null);
  const [actionError, setActionError] = useState(null);
  const [pendingType, setPendingType] = useState(null);
  const { data, loading, error } = useQuery(GET_MY_NOTIFICATION_PREFERENCES, { skip: !isOpen, fetchPolicy: 'cache-and-network' });
  const [updatePreference] = useMutation(UPDATE_NOTIFICATION_PREFERENCE);
  const preferences = data?.myNotificationPreferences ?? [];

  useEffect(() => { pendingTypeRef.current = pendingType; }, [pendingType]);

  useEffect(() => {
    if (!isOpen) return undefined;
    setActionError(null);
    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !pendingTypeRef.current) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      const previous = previousFocusRef.current;
      if (previous && document.contains(previous) && typeof previous.focus === 'function') previous.focus();
      previousFocusRef.current = null;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggle = async (preference) => {
    const nextValue = !preference.isEnabled;
    setActionError(null);
    setPendingType(preference.type);
    try {
      await updatePreference({
        variables: { type: preference.type, isEnabled: nextValue },
        optimisticResponse: { updateNotificationPreference: { __typename: 'NotificationPreference', ...preference, isEnabled: nextValue, updatedAt: new Date().toISOString() } },
      });
    } catch (mutationError) {
      setActionError(mutationError.message || 'No se pudo guardar la preferencia.');
    } finally {
      setPendingType(null);
    }
  };

  return createPortal(
    <div role="presentation" className="fixed inset-0 z-[130] flex bg-transparent" onMouseDown={(event) => { if (event.target === event.currentTarget && !pendingType) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby={titleId} className="ml-auto flex h-full w-full max-w-sm flex-col overflow-hidden border-l border-slate-200 bg-slate-100/98 shadow-[-24px_0_70px_rgba(15,23,42,0.16)] sm:rounded-l-2xl dark:border-white/10 dark:bg-slate-800/98 dark:shadow-[-24px_0_70px_rgba(15,23,42,0.38)]">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 dark:border-white/10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-300">Preferencias</p>
            <h2 id={titleId} className="mt-1 text-lg font-bold tracking-tight text-slate-950 dark:text-slate-100">Configuración de notificaciones</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">Elegí qué eventos querés recibir.</p>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} disabled={Boolean(pendingType)} aria-label="Cerrar configuración" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"><i className="fa-solid fa-xmark" /></button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {(error || actionError) && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-200">{actionError || error.message}</p>}
          {loading && preferences.length === 0 ? (
            <div className="space-y-2" aria-label="Cargando preferencias">{[1, 2, 3, 4].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />)}</div>
          ) : (
            <div className="grid gap-2">
              {preferences.map((preference) => {
                const isPending = pendingType === preference.type;
                return (
                  <button key={preference.id} type="button" role="switch" aria-checked={preference.isEnabled} disabled={Boolean(pendingType)} onClick={() => handleToggle(preference)} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-70 dark:border-white/10 dark:bg-slate-700/65 dark:hover:border-cyan-300/25 dark:hover:bg-slate-700">
                    <span className="min-w-0"><span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{labels[preference.type] ?? preference.type}</span><span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-300">{preference.isEnabled ? 'Activadas' : 'Desactivadas'}</span></span>
                    <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${preference.isEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}><span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${preference.isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />{isPending && <span className="sr-only">Guardando</span>}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
};
