import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import useAuth from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { GET_CAREERS, GET_MY_CAREERS } from '../../data/graphql/queries/careers';
import { GET_SUBJECTS } from '../../data/graphql/queries/subjects';
import {
  GET_ACADEMIC_PROGRESS_FOR_USER,
  GET_ACADEMIC_RESOURCES,
  GET_ACADEMIC_STUDENTS,
  GET_MY_ACADEMIC_PROGRESS,
} from '../../data/graphql/queries/academic';
import {
  DELETE_RESOURCE,
  SYNC_SIU_GRADES,
  UPLOAD_ACADEMIC_RESOURCE,
  UPSERT_ACADEMIC_PROGRESS,
} from '../../data/graphql/mutations/academic';
import { UPLOAD_ACCEPT, uploadAttachment, apiBaseUrl } from '../../utils/uploadFile';

const progressStatuses = [
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'REGULAR', label: 'Regular' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'FREE', label: 'Libre' },
];

const statusLabels = {
  IN_PROGRESS: 'En curso',
  REGULAR: 'Regular',
  APPROVED: 'Aprobado',
  FREE: 'Libre',
};

const resourceCategories = [
  { value: '', label: 'Todas', icon: 'fa-layer-group' },
  { value: 'LIBRO', label: 'Libro', icon: 'fa-book' },
  { value: 'APUNTE', label: 'Apunte', icon: 'fa-file-lines' },
  { value: 'EXAMEN', label: 'Examen', icon: 'fa-clipboard-check' },
  { value: 'OTRO', label: 'Otro', icon: 'fa-folder-open' },
];

const resourceCategoryLabels = resourceCategories.reduce((acc, item) => {
  if (item.value) acc[item.value] = item.label;
  return acc;
}, {});

const emptyResourceForm = {
  title: '',
  description: '',
  externalUrl: '',
  category: 'APUNTE',
  version: '1',
};

const isAcademicManagerRole = (role) => role === 'Administrador' || role === 'Profesor';

const resolveFileHref = (fileUrl) => {
  if (!fileUrl) return null;
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${apiBaseUrl}${fileUrl}`;
};

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const formatScore = (score) => {
  if (score === null || score === undefined || score === '') return 'Sin nota';
  return Number(score).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const getResourceIcon = (resource) => {
  if (resource.fileUrl) {
    const url = resource.fileUrl.toLowerCase();
    if (url.endsWith('.pdf')) return 'fa-file-pdf';
    if (/\.(doc|docx)$/i.test(url)) return 'fa-file-word';
    if (/\.(ppt|pptx)$/i.test(url)) return 'fa-file-powerpoint';
    if (/\.(xls|xlsx)$/i.test(url)) return 'fa-file-excel';
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(url)) return 'fa-file-image';
  }
  if (resource.externalUrl && !resource.fileUrl) return 'fa-link';
  return 'fa-file-lines';
};

export const AcademicDashboard = () => {
  const { auth, token } = useAuth();
  const isManager = isAcademicManagerRole(auth.role);
  const isAdmin = auth.role === 'Administrador';

  const [selectedCareerId, setSelectedCareerId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [activeTab, setActiveTab] = useState('resources');
  const [feedback, setFeedback] = useState(null);
  const [siuSyncResult, setSiuSyncResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceCategory, setResourceCategory] = useState('');
  const {
    form: resourceForm,
    changed: changeResourceForm,
    reset: resetResourceFormState,
  } = useForm(emptyResourceForm);
  const [progressForm, setProgressForm] = useState({
    userId: '',
    score: '',
    status: 'IN_PROGRESS',
    notes: '',
  });

  const { data: allCareersData, loading: allCareersLoading } = useQuery(GET_CAREERS, {
    skip: !isAdmin,
  });
  const { data: myCareersData, loading: myCareersLoading } = useQuery(GET_MY_CAREERS, {
    skip: isAdmin,
  });
  const careers = useMemo(
    () => (isAdmin ? allCareersData?.careers ?? [] : myCareersData?.myCareers ?? []),
    [allCareersData, isAdmin, myCareersData],
  );
  const careersLoading = isAdmin ? allCareersLoading : myCareersLoading;

  const { data: subjectsData, loading: subjectsLoading } = useQuery(GET_SUBJECTS, {
    variables: { careerId: selectedCareerId ? Number(selectedCareerId) : null },
    skip: !selectedCareerId,
  });
  const subjects = subjectsData?.subjects ?? [];

  const selectedSubjectNumericId = selectedSubjectId ? Number(selectedSubjectId) : null;
  const normalizedResourceSearch = resourceSearch.trim();
  const resourceQueryVariables = useMemo(
    () => ({
      subjectId: selectedSubjectNumericId,
      searchTerm: null,
      category: resourceCategory || null,
    }),
    [resourceCategory, selectedSubjectNumericId],
  );
  const { data: resourcesData, loading: resourcesLoading } = useQuery(GET_ACADEMIC_RESOURCES, {
    variables: resourceQueryVariables,
    skip: !selectedSubjectNumericId,
    fetchPolicy: 'cache-and-network',
  });
  const resources = resourcesData?.academicResources ?? [];
  const visibleResources = useMemo(() => {
    if (!normalizedResourceSearch) return resources;
    const normalizedTitleSearch = normalizedResourceSearch.toLocaleLowerCase('es-AR');
    return resources.filter((resource) => (resource.title ?? '').toLocaleLowerCase('es-AR').includes(normalizedTitleSearch));
  }, [normalizedResourceSearch, resources]);

  const { data: myProgressData, loading: myProgressLoading, refetch: refetchMyProgress } = useQuery(GET_MY_ACADEMIC_PROGRESS, {
    fetchPolicy: 'cache-and-network',
  });
  const myProgress = myProgressData?.myAcademicProgress ?? [];

  const { data: studentsData, loading: studentsLoading } = useQuery(GET_ACADEMIC_STUDENTS, {
    variables: { subjectId: selectedSubjectNumericId },
    skip: !isManager || !selectedSubjectNumericId,
  });
  const students = studentsData?.academicStudents ?? [];

  const { data: selectedStudentProgressData, refetch: refetchSelectedStudentProgress } = useQuery(GET_ACADEMIC_PROGRESS_FOR_USER, {
    variables: { userId: progressForm.userId },
    skip: !isAdmin || !progressForm.userId,
    fetchPolicy: 'cache-and-network',
  });
  const selectedStudentProgress = selectedStudentProgressData?.academicProgressForUser ?? [];

  const [uploadAcademicResource, { loading: addingResource }] = useMutation(UPLOAD_ACADEMIC_RESOURCE);
  const [deleteResource, { loading: deletingResource }] = useMutation(DELETE_RESOURCE);
  const [upsertAcademicProgress, { loading: savingProgress }] = useMutation(UPSERT_ACADEMIC_PROGRESS);
  const [syncSiuGrades, { loading: syncingSiu }] = useMutation(SYNC_SIU_GRADES);

  useEffect(() => {
    if (!selectedCareerId && careers.length === 1) {
      setSelectedCareerId(String(careers[0].id));
    }
  }, [careers, selectedCareerId]);

  useEffect(() => {
    setSelectedSubjectId('');
    setProgressForm((current) => ({ ...current, userId: '' }));
  }, [selectedCareerId]);

  useEffect(() => {
    setProgressForm((current) => ({ ...current, userId: '' }));
    setSiuSyncResult(null);
    setResourceSearch('');
    setResourceCategory('');
  }, [selectedSubjectId]);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => String(subject.id) === String(selectedSubjectId)),
    [selectedSubjectId, subjects],
  );

  const filteredMyProgress = useMemo(() => {
    if (!selectedSubjectId) return myProgress;
    return myProgress.filter((item) => String(item.subject?.id) === String(selectedSubjectId));
  }, [myProgress, selectedSubjectId]);

  const resetResourceForm = () => {
    resetResourceFormState();
    setSelectedFile(null);
  };

  const openResourceModal = () => {
    setFeedback(null);
    setIsResourceModalOpen(true);
  };

  const closeResourceModal = () => {
    setIsResourceModalOpen(false);
    resetResourceForm();
  };

  const submitResource = async (event) => {
    event.preventDefault();
    if (!selectedSubjectNumericId) {
      setFeedback({ type: 'error', message: 'Selecciona una materia antes de crear un recurso.' });
      return;
    }
    if (!resourceForm.title.trim()) {
      setFeedback({ type: 'error', message: 'El titulo del recurso es obligatorio.' });
      return;
    }
    if (!selectedFile && !resourceForm.externalUrl.trim()) {
      setFeedback({ type: 'error', message: 'Adjunta un archivo o agrega un enlace externo.' });
      return;
    }
    const version = Number(resourceForm.version || 1);
    if (!Number.isInteger(version) || version < 1) {
      setFeedback({ type: 'error', message: 'La version debe ser un numero entero mayor o igual a 1.' });
      return;
    }

    try {
      setFeedback(null);
      setIsUploading(true);
      const fileUrl = selectedFile ? await uploadAttachment(selectedFile, token) : null;
      setIsUploading(false);

      await uploadAcademicResource({
        variables: {
          subjectId: selectedSubjectNumericId,
          title: resourceForm.title.trim(),
          description: resourceForm.description.trim() || null,
          category: resourceForm.category || 'OTRO',
          version,
          fileUrl,
          externalUrl: resourceForm.externalUrl.trim() || null,
        },
        update: (cache, { data }) => {
          const created = data?.uploadAcademicResource;
          if (!created) return;
          if (resourceCategory && created.category !== resourceCategory) return;

          cache.updateQuery(
            {
              query: GET_ACADEMIC_RESOURCES,
              variables: resourceQueryVariables,
            },
            (current) => {
              const currentResources = current?.academicResources ?? [];
              if (currentResources.some((resource) => resource.id === created.id)) return current;
              return {
                academicResources: [created, ...currentResources],
              };
            },
          );
        },
      });
      closeResourceModal();
      setFeedback({ type: 'success', message: 'Recurso academico publicado.' });
    } catch (error) {
      setIsUploading(false);
      setFeedback({ type: 'error', message: error.message || 'No se pudo crear el recurso.' });
    }
  };

  const removeResource = async (resourceId) => {
    try {
      await deleteResource({
        variables: { resourceId },
        update: (cache) => {
          cache.updateQuery(
            {
              query: GET_ACADEMIC_RESOURCES,
              variables: resourceQueryVariables,
            },
            (current) => ({
              academicResources: (current?.academicResources ?? []).filter((resource) => resource.id !== resourceId),
            }),
          );
        },
      });
      setFeedback({ type: 'success', message: 'Recurso eliminado del hub.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No se pudo actualizar el recurso.' });
    }
  };

  const submitProgress = async (event) => {
    event.preventDefault();
    if (!selectedSubjectNumericId || !progressForm.userId) {
      setFeedback({ type: 'error', message: 'Selecciona una materia y un estudiante.' });
      return;
    }

    const score = progressForm.score === '' ? null : Number(progressForm.score);
    if (score !== null && (Number.isNaN(score) || score < 0 || score > 10)) {
      setFeedback({ type: 'error', message: 'La nota debe estar entre 0 y 10.' });
      return;
    }

    try {
      await upsertAcademicProgress({
        variables: {
          userId: progressForm.userId,
          subjectId: selectedSubjectNumericId,
          score,
          status: progressForm.status,
          notes: progressForm.notes.trim() || null,
        },
      });
      setFeedback({ type: 'success', message: 'Progreso academico guardado.' });
      await refetchMyProgress();
      if (isAdmin && progressForm.userId) {
        await refetchSelectedStudentProgress();
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No se pudo guardar el progreso.' });
    }
  };

  const runSiuSync = async () => {
    if (!selectedSubjectNumericId) {
      setFeedback({ type: 'error', message: 'Selecciona una materia antes de sincronizar SIU.' });
      return;
    }

    try {
      setFeedback(null);
      const { data } = await syncSiuGrades({
        variables: { subjectId: selectedSubjectNumericId },
      });
      const result = data?.syncSiuGrades;
      setSiuSyncResult(result ?? null);
      await refetchMyProgress();
      if (isAdmin && progressForm.userId) {
        await refetchSelectedStudentProgress();
      }
      setFeedback({ type: 'success', message: result?.message ?? 'Sincronizacion SIU finalizada.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No se pudo sincronizar SIU.' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-slate-900 dark:text-slate-100">
      <header className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm dark:border-white/10 dark:bg-none dark:bg-slate-900/70 dark:shadow-[0_18px_50px_rgba(2,6,23,0.24)]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">Modulo academico</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Recursos, materias y progreso</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Consulta apuntes por materia y revisa el seguimiento academico. Profesores y administradores pueden cargar recursos y actualizar el progreso de estudiantes.
        </p>
      </header>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Carrera</span>
          <select
            value={selectedCareerId}
            onChange={(event) => setSelectedCareerId(event.target.value)}
            disabled={careersLoading}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200 dark:focus:ring-blue-500/20"
          >
            <option value="">{careersLoading ? 'Cargando carreras...' : 'Selecciona una carrera'}</option>
            {careers.map((career) => (
              <option key={career.id} value={career.id}>
                {career.name} ({career.code})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Materia</span>
          <select
            value={selectedSubjectId}
            onChange={(event) => setSelectedSubjectId(event.target.value)}
            disabled={!selectedCareerId || subjectsLoading}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200 dark:focus:ring-blue-500/20"
          >
            <option value="">{subjectsLoading ? 'Cargando materias...' : 'Selecciona una materia'}</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code}){subject.year ? ` - ${subject.year} anio` : ''}
              </option>
            ))}
          </select>
        </label>
      </section>

      <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
        <button
          type="button"
          onClick={() => setActiveTab('resources')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'resources' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100'
          }`}
        >
          Recursos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'progress' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100'
          }`}
        >
          Progreso y notas
        </button>
      </nav>

      {activeTab === 'resources' ? (
        <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">Filtros</p>
              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Buscar por titulo</span>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-slate-950/70">
                  <i className="fa-solid fa-magnifying-glass text-xs text-slate-400" />
                  <input
                    value={resourceSearch}
                    onChange={(event) => setResourceSearch(event.target.value)}
                    disabled={!selectedSubjectId}
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                    placeholder="Ej. parcial, guia, SQL"
                  />
                </div>
              </label>

              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Categoria</span>
                <select
                  value={resourceCategory}
                  onChange={(event) => setResourceCategory(event.target.value)}
                  disabled={!selectedSubjectId}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200 dark:focus:ring-blue-500/20"
                >
                  {resourceCategories.map((category) => (
                    <option key={category.value || 'all'} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                <p className="font-bold uppercase tracking-wide text-slate-400">Scope</p>
                <p className="mt-1">
                  {selectedSubject
                    ? `${selectedSubject.name} - ${selectedSubject.career?.name ?? 'Carrera'}`
                    : 'Los recursos se habilitan al elegir una materia.'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Materias</p>
              <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
                {subjects.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Selecciona una carrera.</p>
                ) : (
                  subjects.map((subject) => (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => setSelectedSubjectId(String(subject.id))}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                        String(subject.id) === String(selectedSubjectId)
                          ? 'border-blue-300 bg-blue-50 text-blue-800 shadow-sm dark:border-blue-400/40 dark:bg-blue-500/15 dark:text-blue-100'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/60 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:border-blue-400/30 dark:hover:bg-blue-500/10'
                      }`}
                    >
                      <span className="block font-semibold">{subject.name}</span>
                      <span className="text-xs text-slate-400">{subject.code}{subject.year ? ` - ${subject.year} anio` : ''}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recursos de la materia</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedSubject ? `${selectedSubject.name} (${selectedSubject.code})` : 'Selecciona una materia para ver recursos.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {resourcesLoading && <span className="text-xs font-semibold text-blue-500">Cargando...</span>}
                <button
                  type="button"
                  disabled={!selectedSubjectId}
                  onClick={openResourceModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
                >
                  <i className="fa-solid fa-plus" />
                  Nuevo recurso
                </button>
              </div>
            </div>

            {!selectedSubjectId ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900/55 dark:text-slate-400">
                Elegi carrera y materia para consultar apuntes, enlaces y archivos.
              </div>
            ) : resources.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900/55 dark:text-slate-400">
                No hay recursos activos para esta materia.
              </div>
            ) : visibleResources.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900/55 dark:text-slate-400">
                No hay recursos que coincidan con "{resourceSearch.trim()}".
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {visibleResources.map((resource) => {
                  const fileHref = resolveFileHref(resource.fileUrl);
                  const canRemoveResource = isManager || String(resource.uploader?.id) === String(auth.id);
                  return (
                    <article key={resource.id} className="flex min-h-[260px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_18px_50px_rgba(2,6,23,0.22)]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-200">
                              <i className={`fa-solid ${getResourceIcon(resource)}`} />
                            </span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{resource.title}</h3>
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-200">
                              {resourceCategoryLabels[resource.category] ?? resource.category ?? 'Otro'}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                              v{resource.version ?? 1}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            Subido por {resource.uploader?.firstName} {resource.uploader?.lastName} - {formatDate(resource.createdAt)}
                          </p>
                        </div>
                        {canRemoveResource && (
                          <button
                            type="button"
                            disabled={deletingResource}
                            onClick={() => removeResource(resource.id)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-400/20 dark:text-red-300 dark:hover:bg-red-500/10"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>

                      {resource.description && <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{resource.description}</p>}

                      <div className="mt-auto flex flex-wrap gap-2 pt-4">
                        {fileHref && (
                          <a
                            href={fileHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                          >
                            <i className="fa-solid fa-file-arrow-down" />
                            Abrir archivo
                          </a>
                        )}
                        {resource.externalUrl && (
                          <a
                            href={resource.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-300/20 dark:text-blue-200 dark:hover:bg-blue-500/10"
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square" />
                            Abrir enlace
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mi progreso academico</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Solo vos y los administradores pueden consultar tus notas.</p>
            </div>

            {myProgressLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900/55 dark:text-slate-400">Cargando progreso...</div>
            ) : filteredMyProgress.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900/55 dark:text-slate-400">
                No hay progreso registrado para la seleccion actual.
              </div>
            ) : (
              filteredMyProgress.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{item.subject?.name}</h3>
                      <p className="text-xs text-slate-400">
                        {item.subject?.career?.name} - {item.subject?.code}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      {statusLabels[item.status] ?? item.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/50">
                      <p className="text-xs font-bold uppercase text-slate-400">Nota</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{formatScore(item.score)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2 dark:bg-slate-950/50">
                      <p className="text-xs font-bold uppercase text-slate-400">Actualizado</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatDate(item.updatedAt)}</p>
                    </div>
                  </div>
                  {item.notes && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{item.notes}</p>}
                </article>
              ))
            )}
          </div>

          {isManager && (
            <aside className="space-y-4">
              {isAdmin && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm dark:border-blue-300/20 dark:bg-blue-500/10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-500">Integracion SIU</p>
                      <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-white">Sincronizar calificaciones</h2>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Ejecuta el adaptador mock para actualizar altas y cambios de notas de la materia seleccionada.
                      </p>
                    </div>
                    <i className="fa-solid fa-arrows-rotate text-blue-500" />
                  </div>

                  <button
                    type="button"
                    disabled={!selectedSubjectId || syncingSiu}
                    onClick={runSiuSync}
                    className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {syncingSiu ? 'Sincronizando...' : 'Sincronizar SIU'}
                  </button>

                  {siuSyncResult && (
                    <div className="mt-4 rounded-xl border border-blue-100 bg-white p-3 text-xs text-slate-600 dark:border-blue-300/20 dark:bg-slate-950/50 dark:text-slate-300">
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{siuSyncResult.processed}</p>
                          <p>Procesados</p>
                        </div>
                        <div>
                          <p className="font-bold text-emerald-600">{siuSyncResult.created}</p>
                          <p>Altas</p>
                        </div>
                        <div>
                          <p className="font-bold text-blue-600">{siuSyncResult.updated}</p>
                          <p>Actualizados</p>
                        </div>
                        <div>
                          <p className="font-bold text-amber-600">{siuSyncResult.skipped}</p>
                          <p>Omitidos</p>
                        </div>
                      </div>
                      {siuSyncResult.skippedItems?.length > 0 && (
                        <ul className="mt-3 list-inside list-disc space-y-1 text-left">
                          {siuSyncResult.skippedItems.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Cargar progreso</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Selecciona una materia y un estudiante de esa carrera.
                </p>

                <form onSubmit={submitProgress} className="mt-4 space-y-4">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Estudiante</span>
                    <select
                      value={progressForm.userId}
                      onChange={(event) => setProgressForm((current) => ({ ...current, userId: event.target.value }))}
                      disabled={!selectedSubjectId || studentsLoading}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200"
                    >
                      <option value="">{studentsLoading ? 'Cargando estudiantes...' : 'Selecciona un estudiante'}</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.lastName}, {student.firstName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Nota</span>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.01"
                        value={progressForm.score}
                        onChange={(event) => setProgressForm((current) => ({ ...current, score: event.target.value }))}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100"
                        placeholder="0-10"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Estado</span>
                      <select
                        value={progressForm.status}
                        onChange={(event) => setProgressForm((current) => ({ ...current, status: event.target.value }))}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100"
                      >
                        {progressStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Observaciones</span>
                    <textarea
                      rows={3}
                      value={progressForm.notes}
                      onChange={(event) => setProgressForm((current) => ({ ...current, notes: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                      placeholder="Comentarios academicos internos..."
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={!selectedSubjectId || !progressForm.userId || savingProgress}
                    className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingProgress ? 'Guardando...' : 'Guardar progreso'}
                  </button>
                </form>
              </div>

              {isAdmin && progressForm.userId && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Progreso del estudiante</h3>
                  {selectedStudentProgress.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">Sin registros cargados.</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {selectedStudentProgress.map((item) => (
                        <div key={item.id} className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950/50">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{item.subject?.name}</p>
                          <p className="text-xs text-slate-500">
                            {statusLabels[item.status] ?? item.status} - {formatScore(item.score)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </aside>
          )}
        </section>
      )}

      {isResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-white p-6 shadow-2xl dark:bg-slate-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">Hub academico</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Nuevo recurso</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {selectedSubject ? `Publicando en ${selectedSubject.name} (${selectedSubject.code})` : 'Selecciona una materia antes de publicar.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeResourceModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                aria-label="Cerrar modal de recurso"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={submitResource} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Titulo</span>
                <input
                  name="title"
                  value={resourceForm.title}
                  onChange={changeResourceForm}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder="Guia de ejercicios"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Descripcion</span>
                <textarea
                  name="description"
                  rows={3}
                  value={resourceForm.description}
                  onChange={changeResourceForm}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder="Material de apoyo para la unidad..."
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Categoria</span>
                  <select
                    name="category"
                    value={resourceForm.category}
                    onChange={changeResourceForm}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {resourceCategories.filter((category) => category.value).map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Version</span>
                  <input
                    name="version"
                    type="number"
                    min="1"
                    step="1"
                    value={resourceForm.version}
                    onChange={changeResourceForm}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Enlace externo</span>
                <input
                  name="externalUrl"
                  value={resourceForm.externalUrl}
                  onChange={changeResourceForm}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder="https://..."
                />
              </label>

              <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/60">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Archivo opcional</span>
                <input
                  type="file"
                  accept={UPLOAD_ACCEPT}
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  className="mt-2 w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-500/15 dark:file:text-blue-100"
                />
                {selectedFile && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{selectedFile.name}</p>}
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeResourceModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedSubjectId || addingResource || isUploading}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? 'Subiendo...' : addingResource ? 'Guardando...' : 'Publicar recurso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
