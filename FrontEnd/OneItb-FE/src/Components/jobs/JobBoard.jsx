import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import useAuth from '../../hooks/useAuth';
import { APPLY_TO_JOB, CREATE_JOB_OFFER, GET_JOB_OFFERS, JOB_OFFER_CREATED } from '../../data/graphql/jobs';

const initialForm = {
  title: '',
  company: '',
  description: '',
  location: '',
};

const canPublishJobOffer = (role) => role === 'Empleador' || role === 'Administrador';
const canApplyToJob = (role) => role === 'Estudiante' || role === 'Egresado';

const formatDate = (value) => {
  if (!value) return 'Fecha no disponible';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const statusLabel = (status) => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'REVIEWED') return 'Revisado';
  if (normalized === 'REJECTED') return 'Rechazado';
  return 'Postulado';
};

const JobSkeleton = () => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-7 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2">
        <div className="h-3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  </div>
);

const JobCard = ({ offer, canApply, applyingOfferId, onApply }) => {
  const myApplication = offer?.applications?.[0] || null;
  const isApplying = applyingOfferId === offer.id;

  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-blue-300/30 dark:hover:shadow-blue-500/10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600 dark:text-blue-300">
            {offer.company}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {offer.title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-blue-500" />
              {offer.location}
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="fa-regular fa-calendar text-blue-500" />
              {formatDate(offer.createdAt)}
            </span>
          </div>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200">
          Activa
        </span>
      </div>

      <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
        {offer.description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5 dark:border-white/10">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Publicado por{' '}
          <span className="font-bold text-slate-800 dark:text-slate-100">
            {offer.employer?.fullName || 'OneITB'}
          </span>
        </div>

        {canApply ? (
          myApplication ? (
            <span className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200">
              <i className="fa-solid fa-circle-check text-xs" />
              {statusLabel(myApplication.status)}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onApply(offer.id)}
              disabled={isApplying}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isApplying ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin text-xs" />
                  Postulando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane text-xs" />
                  Postularse
                </>
              )}
            </button>
          )
        ) : (
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Postulacion disponible para estudiantes y egresados
          </span>
        )}
      </div>
    </article>
  );
};

export const JobBoard = () => {
  const { auth } = useAuth();
  const canPublish = canPublishJobOffer(auth?.role);
  const canApply = canApplyToJob(auth?.role);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState(null);
  const [liveOffers, setLiveOffers] = useState([]);
  const [applyingOfferId, setApplyingOfferId] = useState(null);

  const { data, loading, error } = useQuery(GET_JOB_OFFERS, {
    variables: { onlyActive: true, first: 50 },
    fetchPolicy: 'cache-and-network',
  });

  const { data: subscriptionData } = useSubscription(JOB_OFFER_CREATED);
  const [createJobOffer, { loading: saving }] = useMutation(CREATE_JOB_OFFER);
  const [applyToJob] = useMutation(APPLY_TO_JOB);

  useEffect(() => {
    const offer = subscriptionData?.jobOfferCreated;
    if (!offer) return;

    setLiveOffers((current) => {
      if (current.some((item) => item.id === offer.id)) return current;
      return [offer, ...current].slice(0, 20);
    });
  }, [subscriptionData]);

  const offers = useMemo(() => {
    const byId = new Map();
    [...liveOffers, ...(data?.jobOffers?.nodes || [])].forEach((offer) => {
      byId.set(offer.id, offer);
    });

    return [...byId.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [data, liveOffers]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setForm(initialForm);
    setFeedback(null);
  };

  const handleApply = async (jobOfferId) => {
    setFeedback(null);
    setApplyingOfferId(jobOfferId);

    try {
      const { data: result } = await applyToJob({
        variables: { jobOfferId },
        update: (cache, { data: mutationData }) => {
          const application = mutationData?.applyToJob;
          if (!application) return;

          cache.updateQuery(
            { query: GET_JOB_OFFERS, variables: { onlyActive: true, first: 50 } },
            (current) => {
              if (!current?.jobOffers?.nodes) return current;

              return {
                jobOffers: {
                  ...current.jobOffers,
                  nodes: current.jobOffers.nodes.map((offer) => (
                    offer.id === jobOfferId
                      ? { ...offer, applications: [application] }
                      : offer
                  )),
                },
              };
            }
          );
        },
      });

      const application = result?.applyToJob;
      if (application) {
        setLiveOffers((current) => current.map((offer) => (
          offer.id === jobOfferId ? { ...offer, applications: [application] } : offer
        )));
        setFeedback({ type: 'success', message: 'Postulacion registrada correctamente.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'No se pudo registrar la postulacion.' });
    } finally {
      setApplyingOfferId(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    try {
      const { data: result } = await createJobOffer({
        variables: {
          title: form.title.trim(),
          company: form.company.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
        },
        update: (cache, { data: mutationData }) => {
          const created = mutationData?.createJobOffer;
          if (!created) return;

          cache.updateQuery(
            { query: GET_JOB_OFFERS, variables: { onlyActive: true, first: 50 } },
            (current) => {
              const nodes = current?.jobOffers?.nodes || [];
              if (nodes.some((offer) => offer.id === created.id)) return current;

              return {
                jobOffers: {
                  ...current?.jobOffers,
                  nodes: [created, ...nodes],
                  totalCount: (current?.jobOffers?.totalCount || 0) + 1,
                },
              };
            }
          );
        },
      });

      const created = result?.createJobOffer;
      if (created) {
        setLiveOffers((current) => [created, ...current.filter((offer) => offer.id !== created.id)]);
      }

      setFeedback({ type: 'success', message: 'Oferta publicada correctamente.' });
      setForm(initialForm);
      setIsModalOpen(false);
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'No se pudo publicar la oferta.' });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          <div className="relative isolate px-6 py-8 sm:px-8">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_35%)]" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600 dark:text-blue-300">
                  Modulo laboral
                </p>
                <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                  Empleos y oportunidades
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Espacio institucional para conectar estudiantes, egresados y empresas con ofertas alineadas al perfil academico de OneITB.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {canPublish && (
                  <Link
                    to="/empleos/mis-ofertas"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <i className="fa-solid fa-list-check text-xs" />
                    Mis ofertas
                  </Link>
                )}
                {canPublish && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    <i className="fa-solid fa-plus text-xs" />
                    Publicar Oferta
                  </button>
                )}
              </div>
            </div>
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

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-300/20 dark:bg-red-400/10 dark:text-red-200">
            No se pudieron cargar las ofertas. Intenta nuevamente en unos minutos.
          </div>
        )}

        <div className="mt-8 grid gap-5">
          {loading && offers.length === 0 && (
            <>
              <JobSkeleton />
              <JobSkeleton />
              <JobSkeleton />
            </>
          )}

          {!loading && offers.length === 0 && !error && (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm dark:border-white/10 dark:bg-slate-900/60">
              <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                <i className="fa-solid fa-briefcase text-xl" />
              </span>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Todavia no hay ofertas activas
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                Cuando un empleador publique una oportunidad, aparecera aca y tambien se notificara en tiempo real.
              </p>
              {canPublish && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-600"
                >
                  <i className="fa-solid fa-plus text-xs" />
                  Publicar primera oferta
                </button>
              )}
            </div>
          )}

          {offers.map((offer) => (
            <JobCard
              key={offer.id}
              offer={offer}
              canApply={canApply}
              applyingOfferId={applyingOfferId}
              onApply={handleApply}
            />
          ))}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/65 px-4 py-6 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20 dark:border-white/10 dark:bg-slate-950 dark:text-white"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600 dark:text-blue-300">
                  Nueva oportunidad
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                  Publicar oferta laboral
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Cerrar"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Titulo</span>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  maxLength={180}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Empresa</span>
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  required
                  maxLength={160}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Ubicacion</span>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  maxLength={160}
                  placeholder="CABA / Hibrido, remoto, etc."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Descripcion</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  maxLength={2000}
                  rows={6}
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin text-xs" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-briefcase text-xs" />
                    Publicar Oferta
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};
