import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_MODERATION_AUDITS } from '../../data/graphql/queries/admin';

const shortId = (id) => `#${String(id ?? '').slice(-6).toUpperCase()}`;

const formatTarget = (audit) => {
  if (audit.targetUser) {
    return `${audit.targetUser.firstName} ${audit.targetUser.lastName} (${audit.targetUser.role})`;
  }
  if (audit.targetInquiry) return audit.targetInquiry.title;
  if (audit.targetComment) return audit.targetComment.content;
  if (audit.targetReport) return `Reporte ${audit.targetReport.status}`;
  return 'Sin objetivo';
};

export const ModerationAuditManagement = () => {
  const { data, loading, error, refetch } = useQuery(GET_MODERATION_AUDITS, {
    variables: { first: 50 },
    fetchPolicy: 'cache-and-network',
  });

  const audits = data?.moderationAudits ?? [];

  if (loading && audits.length === 0) {
    return <p className="p-8 text-center text-sm text-slate-500">Cargando auditoria...</p>;
  }

  if (error) {
    return <p className="p-8 text-center text-sm text-red-600">Error: {error.message}</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Auditoria de moderacion</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ultimas acciones administrativas y de moderacion persistidas.</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/15"
        >
          Actualizar
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Accion</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Objetivo</th>
                <th className="px-5 py-3">Resumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {audits.map((audit) => (
                <tr key={audit.id}>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    <p>{new Date(audit.createdAt).toLocaleDateString('es-AR')}</p>
                    <p>{new Date(audit.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{shortId(audit.id)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {audit.action}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {audit.actorUser?.firstName} {audit.actorUser?.lastName}
                    </p>
                    <p className="text-xs text-slate-400">{audit.actorUser?.role}</p>
                  </td>
                  <td className="max-w-xs px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                    <p className="truncate">{formatTarget(audit)}</p>
                  </td>
                  <td className="max-w-sm px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    <p className="line-clamp-2">{audit.summary}</p>
                  </td>
                </tr>
              ))}
              {audits.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-sm text-slate-500">
                    Todavia no hay eventos de auditoria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
