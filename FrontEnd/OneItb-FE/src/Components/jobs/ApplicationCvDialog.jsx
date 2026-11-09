import React, { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { APPLICATION_CV, MY_APPLICATION_CV_PREVIEW } from '../../data/graphql/jobs';
import { useCvAtsPrint } from '../../hooks/useCvAtsPrint';
import { CVATSPrintTemplate } from '../resume/CVATSPrintTemplate';

const actionClass = 'rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-50';

const CvDialog = ({ title, onClose, busy, children }) => {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);

  return (
    <dialog ref={ref} aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
      className="m-auto max-h-[92vh] w-[min(96vw,54rem)] overflow-auto rounded-2xl bg-white p-5 text-slate-900 shadow-xl backdrop:bg-slate-950/70 dark:bg-slate-900 dark:text-white">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 id={titleId} className="text-xl font-bold">{title}</h2>
        <button type="button" className={actionClass} disabled={busy} onClick={onClose}>Cerrar</button>
      </header>
      {children}
    </dialog>
  );
};

// The immutable snapshot carries display order, without mutable database row IDs.
const entries = (items) => items.map((item, index) => ({ ...item, id: String(index) }));
const toPrintData = (cv) => ({
  personalInfo: { name: cv.name, title: cv.title, email: cv.email, phone: cv.phone,
    location: cv.careerNames.join(' / '), linkedin: cv.linkedIn, website: cv.website },
  summary: cv.summary, experience: entries(cv.experience), education: entries(cv.education),
  projects: entries(cv.projects), skills: entries(cv.skills), languages: entries(cv.languages),
});

export const ApplyCvDialog = ({ offer, onClose, onConfirm, busy }) => {
  const { data, loading, error, refetch } = useQuery(MY_APPLICATION_CV_PREVIEW, {
    fetchPolicy: 'no-cache', notifyOnNetworkStatusChange: true,
  });
  const [failure, setFailure] = useState('');
  const [requiresReview, setRequiresReview] = useState(false);
  const preview = data?.myApplicationCvPreview;
  const submit = async () => {
    setFailure('');
    try {
      await onConfirm(offer.id, preview.version);
    } catch (err) {
      setFailure(err.message || 'No se pudo enviar la postulación.');
      if (err.graphQLErrors?.some(item => item.extensions?.code === 'CV_VERSION_CHANGED')) setRequiresReview(true);
    }
  };
  const reload = async () => {
    try {
      await refetch();
      setRequiresReview(false);
      setFailure('');
    } catch {
      setFailure('No se pudo actualizar el CV. Vuelve a intentarlo.');
    }
  };
  return (
    <CvDialog title={`Postularme a ${offer.title}`} busy={busy} onClose={onClose}>
      {loading && <p role="status">Cargando tu CV guardado…</p>}
      {error && <p role="alert">No se pudo cargar tu CV. <button className={actionClass} onClick={reload}>Reintentar</button></p>}
      {failure && <p role="alert">{failure}</p>}
      {!loading && !error && preview && <>
        {preview.canSubmit ? <>
          <p className="mb-4">Si confirmas, {offer.company} recibirá esta copia de tu CV, incluidos los datos de contacto que aparecen aquí.</p>
          <CVATSPrintTemplate data={toPrintData(preview.cv)} />
        </> : <p>Completa el resumen profesional o una sección visible de tu CV para postularte.</p>}
        <footer className="mt-4 flex flex-wrap gap-3">
          {!busy && <Link className={actionClass} to={`/profile/edit?jobOfferId=${encodeURIComponent(offer.id)}`}>Editar mi CV</Link>}
          {requiresReview
            ? <button className={actionClass} onClick={reload}>Actualizar vista previa</button>
            : preview.canSubmit && <button className={actionClass} disabled={busy} onClick={submit}>
                {busy ? 'Enviando…' : 'Confirmar postulación'}
              </button>}
        </footer>
      </>}
    </CvDialog>
  );
};

export const CandidateCvDialog = ({ application, onClose, onUpdateStatus, updatingStatus }) => {
  const { data, loading, error, refetch } = useQuery(APPLICATION_CV, {
    variables: { applicationId: application.id }, fetchPolicy: 'no-cache', notifyOnNetworkStatusChange: true,
  });
  const [retryError, setRetryError] = useState('');
  const ref = useRef(null);
  const cv = data?.applicationCv;
  const { printCv, isPrinting, printError } = useCvAtsPrint({ contentRef: ref, documentTitle: cv?.name });
  return (
    <CvDialog title={application.applicant?.fullName || 'Candidatura'} onClose={onClose} busy={updatingStatus}>
      {loading && <p role="status">Cargando el CV enviado…</p>}
      {error && <p role="alert">{retryError || 'No se pudo acceder al CV.'} <button className={actionClass}
        onClick={() => refetch().catch(() => setRetryError('El CV sigue sin estar disponible.'))}>Reintentar</button></p>}
      {!loading && !error && data?.applicationCv === null && <p>Esta postulación no incluyó un CV guardado</p>}
      {!loading && !error && cv && <>
        <button className={actionClass} disabled={isPrinting} onClick={printCv}>Imprimir CV</button>
        {printError && <p role="alert">{printError}</p>}
        <CVATSPrintTemplate ref={ref} data={toPrintData(cv)} />
      </>}
      <footer className="mt-4 flex gap-3">
        <button className={actionClass} disabled={updatingStatus} onClick={() => onUpdateStatus(application.id, 'REVIEWED')}>Marcar revisado</button>
        <button className={actionClass} disabled={updatingStatus} onClick={() => onUpdateStatus(application.id, 'REJECTED')}>Rechazar</button>
      </footer>
    </CvDialog>
  );
};
