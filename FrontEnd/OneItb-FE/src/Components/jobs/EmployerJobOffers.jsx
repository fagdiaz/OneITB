import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { GET_MY_JOB_OFFERS, UPDATE_APPLICATION_STATUS, GET_EMPLOYMENT_APPLICATION } from '../../data/graphql/jobs';

import { CandidateCvDialog } from './ApplicationCvDialog';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'REVIEWED', label: 'Revisados' },
  { value: 'REJECTED', label: 'Rechazados' },
];

const statusConfig = {
  PENDING: {
    label: 'Pendiente',
    className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-300/20 dark:bg-amber-400/10 dark:text-amber-200',
  },
  REVIEWED: {
    label: 'Revisado',
    className: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-300/20 dark:bg-blue-400/10 dark:text-blue-200',
  },
  REJECTED: {
    label: 'Rechazado',
    className: 'border-red-200 bg-red-50 text-red-700 dark:border-red-300/20 dark:bg-red-400/10 dark:text-red-200',
  },
};

const normalizeStatus = (status) => String(status || 'PENDING').toUpperCase();

const formatDate = (value) => {
  if (!value) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const ApplicationRow = ({ application, onOpen }) => {
  const config = statusConfig[normalizeStatus(application.status)] || statusConfig.PENDING;
  const applicant = application.applicant || {};

  return (
    <button
      type="button"
      onClick={() => onOpen(application)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-white/10 dark:bg-slate-900/70 dark:hover:border-blue-300/30"
    >
      <div>
        <p className="font-bold text-slate-950 dark:text-white">{applicant.fullName || 'Postulante'}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {formatDate(application.appliedAt)}
        </p>
      </div>
      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${config.className}`}>
        {config.label}
      </span>
    </button>
  );
};

const AtsSkeleton = () => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900/60">
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  </div>
);

export const EmployerJobOffers = () => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchParams] = useSearchParams();
  const targetApplicationId = searchParams.get('applicationId');
  const targetAppliedRef = React.useRef(false);

  const { data: targetAppData, loading: targetAppLoading } = useQuery(GET_EMPLOYMENT_APPLICATION, {
    variables: { applicationId: targetApplicationId },
    skip: !targetApplicationId,
    fetchPolicy: 'cache-and-network',
  });
  const [feedback, setFeedback] = useState(null);

  const { data, loading, error } = useQuery(GET_MY_JOB_OFFERS, {
    variables: { first: 50 },
    fetchPolicy: 'cache-and-network',
  });
  const [updateApplicationStatus, { loading: updatingStatus }] = useMutation(UPDATE_APPLICATION_STATUS);

  const offers = data?.myJobOffers?.nodes || [];
  React.useEffect(() => {
    if (!targetApplicationId || targetAppliedRef.current) return;
    const allApps = offers.flatMap((o) => o.applications || []);
    const matching = allApps.find((a) => a.id === targetApplicationId);
    if (matching) {
      targetAppliedRef.current = true;
      setSelectedApplication(matching);
    } else if (targetAppData?.employmentApplication) {
      targetAppliedRef.current = true;
      setSelectedApplication(targetAppData.employmentApplication);
    }
  }, [targetApplicationId, offers, targetAppData]);

  const totalApplications = useMemo(
    () => offers.reduce((total, offer) => total + (offer.applications?.length || 0), 0),
    [offers]
  );

  const handleUpdateStatus = async (applicationId, status) => {
    setFeedback(null);

    try {
      const { data: result } = await updateApplicationStatus({ variables: { applicationId, status } });
      const updated = result?.updateApplicationStatus;
      if (updated) {
        setSelectedApplication(updated);
        setFeedback({ type: 'success', message: 'Estado de postulacion actualizado.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'No se pudo actualizar el estado.' });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
        {targetApplicationId && !targetAppLoading && !loading && !offers.flatMap((o) => o.applications || []).some((a) => a.id === targetApplicationId) && !targetAppData?.employmentApplication && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-triangle-exclamation text-base" />
              <span>La postulación solicitada no está disponible o no tienes permisos para acceder a ella.</span>
            </div>
            <Link
              to="/empleos/mis-ofertas"
              replace
              className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 dark:bg-red-500/30 dark:hover:bg-red-500/50"
            >
              Volver
            </Link>
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600 dark:text-blue-300">
                Gestor de Postulaciones
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                Mis ofertas y postulantes
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                Revisa candidatos, consulta el CV enviado y actualiza el estado de cada postulacion desde un flujo simple y trazable.
              </p>
            </div>
            <Link
              to="/empleos"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <i className="fa-solid fa-arrow-left text-xs" />
              Volver a empleos
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
              {offers.length} ofertas
            </span>
            <span className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 dark:bg-blue-400/10 dark:text-blue-200">
              {totalApplications} postulaciones
            </span>
          </div>
        </div>

        {feedback && (
          <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-300/20 dark:bg-red-400/10 dark:text-red-200'
          }`}>
            {feedback.message}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatusFilter(option.value)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                statusFilter === option.value
                  ? 'border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 active:translate-y-0 active:scale-[0.98] dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-300/30 dark:hover:text-blue-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-300/20 dark:bg-red-400/10 dark:text-red-200">
            No se pudieron cargar tus ofertas.
          </div>
        )}

        <div className="mt-8 grid gap-5">
          {loading && offers.length === 0 && (
            <>
              <AtsSkeleton />
              <AtsSkeleton />
            </>
          )}

          {!loading && offers.length === 0 && !error && (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-white/10 dark:bg-slate-900/60">
              <i className="fa-solid fa-briefcase text-3xl text-blue-600 dark:text-blue-300" />
              <h2 className="mt-4 text-2xl font-black tracking-tight">Todavia no publicaste ofertas</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                Publica una oferta desde el tablero laboral para empezar a recibir postulantes.
              </p>
            </div>
          )}

          {offers.map((offer) => {
            const applications = (offer.applications || []).filter((application) => (
              statusFilter === 'ALL' || normalizeStatus(application.status) === statusFilter
            ));

            return (
              <article key={offer.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600 dark:text-blue-300">
                      {offer.company}
                    </p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                      {offer.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {offer.location} - publicada el {formatDate(offer.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 dark:border-white/10 dark:text-slate-300">
                    {offer.applications?.length || 0} postulantes
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {applications.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                      No hay postulantes para este filtro.
                    </div>
                  ) : (
                    applications.map((application) => (
                      <ApplicationRow
                        key={application.id}
                        application={application}
                        onOpen={setSelectedApplication}
                      />
                    ))
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {selectedApplication && <CandidateCvDialog key={selectedApplication.id}
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onUpdateStatus={handleUpdateStatus}
        updatingStatus={updatingStatus}
      />}
    </main>
  );
};
