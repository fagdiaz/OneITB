import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_COMMUNITY_REPORTS } from '../../data/graphql/queries/admin';

export const ModerationManagement = () => {
  const { data, loading, error, refetch } = useQuery(GET_COMMUNITY_REPORTS, {
    fetchPolicy: 'cache-and-network'
  });
  const reports = data?.communityReports ?? [];
  const pendingReports = useMemo(
    () => reports.filter((report) => report.status === 'Pending'),
    [reports]
  );

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
          <h2 className="text-lg font-bold text-slate-800">Moderación y reportes</h2>
          <p className="text-sm text-slate-500">{pendingReports.length} reportes pendientes.</p>
        </div>
        <button type="button" onClick={() => refetch()} className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600">
          Actualizar
        </button>
      </div>

      <div className="space-y-3">
        {pendingReports.map((report) => (
          <article key={report.id} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-800">{report.inquiry?.title}</h3>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                {report.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{report.reason}</p>
            <p className="mt-3 text-xs text-slate-500">
              Reportado por {report.reporter?.firstName} {report.reporter?.lastName} · {new Date(report.createdAt).toLocaleString()}
            </p>
          </article>
        ))}
        {pendingReports.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No hay reportes pendientes.
          </p>
        )}
      </div>
    </section>
  );
};
