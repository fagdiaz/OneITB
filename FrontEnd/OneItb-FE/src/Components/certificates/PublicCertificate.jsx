import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PUBLIC_CERTIFICATE } from '../../data/graphql/queries/certificates';

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(value));
};

const formatScore = (score) => {
  if (score === null || score === undefined) return 'Sin calificacion numerica';
  return Number(score).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const upsertMeta = (selector, attributeName, attributeValue, content) => {
  let element = document.head.querySelector(selector);
  const created = !element;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
  return created ? element : null;
};

export const PublicCertificate = () => {
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_PUBLIC_CERTIFICATE, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });
  const certificate = data?.publicCertificate;

  useEffect(() => {
    if (!certificate) return undefined;

    const title = `Constancia OneITB - ${certificate.studentFullName}`;
    const description = `${certificate.studentFullName} aprobo ${certificate.subjectName} (${certificate.subjectCode}) en ${certificate.careerName}.`;
    const createdMeta = [
      upsertMeta('meta[property="og:title"]', 'property', 'og:title', title),
      upsertMeta('meta[property="og:description"]', 'property', 'og:description', description),
      upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'article'),
      upsertMeta('meta[name="description"]', 'name', 'description', description),
    ].filter(Boolean);

    const previousTitle = document.title;
    document.title = title;

    return () => {
      document.title = previousTitle;
      createdMeta.forEach((element) => element.remove());
    };
  }, [certificate]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <section className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-blue-200"
        >
          <i className="fa-solid fa-arrow-left" />
          Volver a OneITB
        </Link>

        {loading && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-400">
            Validando constancia...
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-sm font-semibold text-red-700 shadow-sm dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
            No se pudo validar la constancia. Puede no existir o no estar aprobada.
          </div>
        )}

        {!loading && certificate && (
          <article className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900/80">
            <div className="border-b border-slate-200 bg-slate-950 px-8 py-8 text-white dark:border-white/10">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-300">Credencial digital publica</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight">Constancia academica OneITB</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Credencial verificable de aprobacion emitida desde el sistema academico institucional.
              </p>
            </div>

            <div className="grid gap-8 p-8 lg:grid-cols-[1fr_260px]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Estudiante</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{certificate.studentFullName}</h2>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/50">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Materia aprobada</p>
                    <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">{certificate.subjectName}</p>
                    <p className="text-sm text-slate-500">{certificate.subjectCode}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/50">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Carrera</p>
                    <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">{certificate.careerName}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-500/10 dark:text-emerald-100">
                    <p className="text-xs font-bold uppercase tracking-wide">Estado</p>
                    <p className="mt-2 text-lg font-black">Aprobado</p>
                  </div>
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-800 dark:border-blue-300/20 dark:bg-blue-500/10 dark:text-blue-100">
                    <p className="text-xs font-bold uppercase tracking-wide">Calificacion</p>
                    <p className="mt-2 text-lg font-black">{formatScore(certificate.score)}</p>
                  </div>
                </div>
              </div>

              <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-slate-950/60">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-600/20">
                  <i className="fa-solid fa-shield-halved" />
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-500">Identificador</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-600 dark:text-slate-300">#{certificate.id.slice(-8).toUpperCase()}</p>
                <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-500">Fecha de emision</p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{formatDate(certificate.updatedAt)}</p>
                <a
                  href={linkedInShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  <i className="fa-brands fa-linkedin" />
                  Compartir en LinkedIn
                </a>
              </aside>
            </div>
          </article>
        )}
      </section>
    </main>
  );
};
