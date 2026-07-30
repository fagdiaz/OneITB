import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  APPROVE_EMPLOYER_REQUEST,
  GET_EMPLOYER_REQUESTS,
  REJECT_EMPLOYER_REQUEST,
  RESEND_EMPLOYER_WELCOME,
} from '../../data/graphql/employerRequests';

const PAGE_SIZE = 15;

const statusLabels = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
};

const deliveryLabels = {
  NOT_REQUESTED: 'No solicitado',
  PENDING: 'Pendiente',
  DELIVERED: 'Entregado',
  FAILED: 'Fallido',
};

const badgeClass = (value) => {
  if (value === 'APPROVED' || value === 'DELIVERED') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200';
  if (value === 'REJECTED' || value === 'FAILED') return 'bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-200';
  if (value === 'PENDING') return 'bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200';
  return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
};

const notify = (message, type = 'success') => {
  window.dispatchEvent(new CustomEvent('oneitb:toast', { detail: { message, type } }));
};

export const EmployerRequestManagement = () => {
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState('');
  const variables = useMemo(() => ({
    status: status || null,
    first: PAGE_SIZE,
    offset,
  }), [status, offset]);
  const { data, loading, error, refetch } = useQuery(GET_EMPLOYER_REQUESTS, {
    variables,
    fetchPolicy: 'cache-and-network',
  });
  const [approve, approveState] = useMutation(APPROVE_EMPLOYER_REQUEST);
  const [reject, rejectState] = useMutation(REJECT_EMPLOYER_REQUEST);
  const [resend, resendState] = useMutation(RESEND_EMPLOYER_WELCOME);
  const page = data?.employerRequests;
  const requests = page?.items ?? [];
  const actionLoading = approveState.loading || rejectState.loading || resendState.loading;

  useEffect(() => {
    if (!action) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !actionLoading) {
        setAction(null);
        setReason('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [action, actionLoading]);

  const changeStatus = (event) => {
    setStatus(event.target.value);
    setOffset(0);
  };

  const executeAction = async () => {
    if (!action || actionLoading) return;
    if (action.kind === 'reject' && !reason.trim()) return;

    try {
      let response;
      if (action.kind === 'approve') {
        response = await approve({ variables: { requestId: action.request.id } });
        notify(response.data?.approveEmployerRequest?.message || 'Solicitud aprobada.');
      } else if (action.kind === 'reject') {
        response = await reject({
          variables: { requestId: action.request.id, reason: reason.trim() },
        });
        notify(response.data?.rejectEmployerRequest?.message || 'Solicitud rechazada.');
      } else {
        response = await resend({ variables: { requestId: action.request.id } });
        notify(response.data?.resendEmployerWelcome?.message || 'Reenvío programado.');
      }
      setAction(null);
      setReason('');
      await refetch();
    } catch (mutationError) {
      notify(mutationError.message, 'error');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Solicitudes de empleadores</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Revisión fiscal, aprovisionamiento de cuentas y estado real del correo de bienvenida.
          </p>
        </div>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Estado
          <select
            value={status}
            onChange={changeStatus}
            className="mt-1 block min-w-48 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-800"
          >
            <option value="">Todos</option>
            <option value="PENDING">Pendientes</option>
            <option value="APPROVED">Aprobadas</option>
            <option value="REJECTED">Rechazadas</option>
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-300/20 dark:bg-red-400/10 dark:text-red-200">
          {error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-200/60 text-xs uppercase tracking-wide text-slate-600 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Empresa y contacto</th>
                <th className="px-4 py-3">CUIT / Teléfono</th>
                <th className="px-4 py-3">Solicitud</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {requests.map((request) => (
                <tr key={request.id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{request.companyName}</p>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">{request.contactName}</p>
                    <a className="text-xs text-blue-700 hover:underline dark:text-cyan-300" href={`mailto:${request.email}`}>{request.email}</a>
                    {request.comments && <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">{request.comments}</p>}
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                    <p className="font-mono">{request.taxId}</p>
                    <p className="mt-1">{request.phone}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass(request.status)}`}>
                      {statusLabels[request.status] || request.status}
                    </span>
                    <p className="mt-2 text-xs text-slate-500">{new Date(request.createdAt).toLocaleString('es-AR')}</p>
                    {request.rejectionReason && <p className="mt-2 max-w-xs text-xs text-red-600 dark:text-red-300">{request.rejectionReason}</p>}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass(request.emailDeliveryStatus)}`}>
                      {deliveryLabels[request.emailDeliveryStatus] || request.emailDeliveryStatus}
                    </span>
                    <p className="mt-2 text-xs text-slate-500">{request.emailDeliveryAttempts} intento(s)</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {request.status === 'PENDING' && (
                        <>
                          <ActionButton label="Aprobar" icon="fa-check" tone="emerald" onClick={() => setAction({ kind: 'approve', request })} />
                          <ActionButton label="Rechazar" icon="fa-xmark" tone="red" onClick={() => setAction({ kind: 'reject', request })} />
                        </>
                      )}
                      {request.status === 'APPROVED' && request.emailDeliveryStatus !== 'PENDING' && (
                        <ActionButton label="Reenviar acceso" icon="fa-paper-plane" tone="blue" onClick={() => setAction({ kind: 'resend', request })} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && requests.length === 0 && (
                <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">No hay solicitudes para este filtro.</td></tr>
              )}
              {loading && requests.length === 0 && (
                <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500"><i className="fa-solid fa-circle-notch mr-2 animate-spin" />Cargando solicitudes...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{page?.totalCount ?? 0} solicitud(es)</span>
        <div className="flex gap-2">
          <button type="button" disabled={offset === 0 || loading} onClick={() => setOffset((current) => Math.max(0, current - PAGE_SIZE))} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold disabled:opacity-40 dark:border-white/10">Anterior</button>
          <button type="button" disabled={!page?.hasNextPage || loading} onClick={() => setOffset(page?.nextOffset ?? offset)} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold disabled:opacity-40 dark:border-white/10">Siguiente</button>
        </div>
      </div>

      {action && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !actionLoading && setAction(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="employer-action-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-2xl dark:border-white/10 dark:bg-slate-800">
            <h3 id="employer-action-title" className="text-lg font-black text-slate-900 dark:text-slate-100">
              {action.kind === 'approve' ? 'Aprobar empresa' : action.kind === 'reject' ? 'Rechazar solicitud' : 'Reenviar acceso'}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {action.request.companyName}. {action.kind === 'approve' ? 'Se creará una cuenta con rol Empleador y el correo quedará pendiente de entrega.' : action.kind === 'resend' ? 'Se invalidará cualquier acceso temporal anterior al emitir uno nuevo.' : 'La decisión quedará registrada en auditoría.'}
            </p>
            {action.kind === 'reject' && (
              <label className="mt-5 block text-sm font-bold">
                Motivo
                <textarea autoFocus value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={4} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-100 p-3 text-sm outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-900" />
              </label>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={actionLoading} onClick={() => { setAction(null); setReason(''); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold dark:border-white/10">Cancelar</button>
              <button type="button" disabled={actionLoading || (action.kind === 'reject' && !reason.trim())} onClick={executeAction} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-slate-100 disabled:opacity-50 dark:bg-cyan-400 dark:text-slate-950">
                {actionLoading ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const ActionButton = ({ label, icon, tone, onClick }) => {
  const tones = {
    emerald: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-300/20 dark:text-emerald-200 dark:hover:bg-emerald-400/10',
    red: 'border-red-200 text-red-700 hover:bg-red-50 dark:border-red-300/20 dark:text-red-200 dark:hover:bg-red-400/10',
    blue: 'border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-300/20 dark:text-blue-200 dark:hover:bg-blue-400/10',
  };
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${tones[tone]}`}>
      <i className={`fa-solid ${icon}`} aria-hidden="true" />{label}
    </button>
  );
};
