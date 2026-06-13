import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_COMMUNITY_REPORTS } from '../../data/graphql/queries/admin';
import { UPDATE_REPORT_STATUS } from '../../data/graphql/mutations/moderation';

export const ModerationManagement = () => {
  const { data, loading, error, refetch } = useQuery(GET_COMMUNITY_REPORTS, {
    fetchPolicy: 'cache-and-network'
  });
  const reports = data?.communityReports ?? [];
  const [view, setView] = useState('pending'); // 'pending' | 'history'

  const pendingReports = useMemo(
    () => reports.filter((report) => report.status === 'Pending'),
    [reports]
  );
  
  const historyReports = useMemo(
    () => reports.filter((report) => report.status !== 'Pending'),
    [reports]
  );
  
  const [updateStatus, { loading: updating }] = useMutation(UPDATE_REPORT_STATUS, {
    refetchQueries: [{ query: GET_COMMUNITY_REPORTS }],
    awaitRefetchQueries: true
  });

  if (loading && reports.length === 0) {
    return <p className="p-8 text-center text-sm text-slate-500">Cargando reportes...</p>;
  }

  if (error) {
    return <p className="p-8 text-center text-sm text-red-600">Error: {error.message}</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Moderacion y reportes</h2>
          <p className="text-sm text-slate-500">
            {pendingReports.length} reportes pendientes, {historyReports.length} en historial.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setView('pending')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                view === 'pending' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Pendientes
            </button>
            <button
              type="button"
              onClick={() => setView('history')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                view === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Historial
            </button>
          </div>
          <button type="button" onClick={() => refetch()} className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100">
            Actualizar
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Publicacion</th>
                <th className="px-5 py-3">Razon</th>
                <th className="px-5 py-3">Reportado por</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(view === 'pending' ? pendingReports : historyReports).map((report) => (
                <tr key={report.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{report.inquiry?.title}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-700">{report.reason}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-slate-800">{report.reporter?.firstName} {report.reporter?.lastName}</p>
                    <p className="text-[11px] text-slate-400">{new Date(report.createdAt).toLocaleDateString('es-AR')} {new Date(report.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      report.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      report.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {view === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={async () => {
                            await updateStatus({ variables: { reportId: report.id, status: 'Resolved' } });
                          }}
                          disabled={updating}
                          className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          Resolver
                        </button>
                        <button
                          onClick={async () => {
                            await updateStatus({ variables: { reportId: report.id, status: 'Rejected' } });
                          }}
                          disabled={updating}
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Procesado</span>
                    )}
                  </td>
                </tr>
              ))}
              {(view === 'pending' ? pendingReports : historyReports).length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-sm text-slate-500">
                    No hay reportes en esta vista.
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
