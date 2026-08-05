import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { TOGGLE_PROFILE_PRIVACY, UPDATE_PROFILE } from '../../data/graphql/mutations/updateProfile';
import { GET_USER_PROFILE } from '../../data/graphql/queries/getUserProfile';
import { GET_CAREERS } from '../../data/graphql/queries/careers';
import { apiBaseUrl, uploadAttachmentDescriptor } from '../../utils/uploadFile';
import { CVData } from '../../types/resume';
import { Button } from '../ui/Button';
import { ExperienceForm } from '../editor/ExperienceForm';
import { EducationForm } from '../editor/EducationForm';
import { ProjectsForm } from '../editor/ProjectsForm';
import { SkillsLanguagesForm } from '../editor/SkillsLanguagesForm';
import { CVATSPrintTemplate, CvAccentTheme } from '../resume/CVATSPrintTemplate';
import { useCvAtsPrint } from '../../hooks/useCvAtsPrint';
import { AvatarEditorModal } from './AvatarEditorModal';
import { ProfileEditorSkeleton } from './ProfileEditorSkeleton';
import {
  selectCareerForRole,
  validateCareerSelectionForRole,
} from './profileCareerSelection';
import {
  buildProfileSessionKey,
  createProfileEditorSnapshot,
  CvSections,
  emptyCvSections,
  emptyProfileForm,
  getMatchingProfile,
  ProfileEditorPhase,
  ProfileFormState,
} from './profileEditorState';

const emitProfilePrivacyToast = (isPublic: boolean) => {
  window.dispatchEvent(
    new CustomEvent('oneitb:toast', {
      detail: {
        type: 'PROFILE_PRIVACY',
        message: isPublic
          ? 'Tu perfil vuelve a estar publico para la comunidad.'
          : 'Tu perfil ahora protege CV, contacto y trayectoria sensible.',
      },
    }),
  );
};

const hasAnyValue = (values: Array<string | undefined>): boolean =>
  values.some((value) => Boolean(value?.trim()));

const resolveAssetUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  if (value.startsWith('data:') || /^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${apiBaseUrl}${value}`;
  return undefined;
};

const normalizeExternalUrl = (value?: string | null, provider?: 'linkedin' | 'instagram' | 'facebook'): string => {
  const raw = value?.trim();
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) return raw;

  const cleaned = raw.replace(/^@/, '').replace(/^\/+/, '');
  if (cleaned.includes('.')) return `https://${cleaned}`;

  if (provider === 'linkedin') return `https://www.linkedin.com/in/${cleaned}`;
  if (provider === 'instagram') return `https://www.instagram.com/${cleaned}`;
  if (provider === 'facebook') return `https://www.facebook.com/${cleaned}`;

  return `https://${cleaned}`;
};

const buildCvInput = (sections: CvSections) => ({
  cvExperiences: sections.experience
    .filter((item) => hasAnyValue([item.company, item.role, item.startDate, item.endDate, item.location, item.description]))
    .map((item) => ({
      company: item.company,
      role: item.role,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      description: item.description,
      hidden: Boolean(item.hidden),
    })),
  cvEducations: sections.education
    .filter((item) => hasAnyValue([item.institution, item.degree, item.startDate, item.endDate, item.location, item.description]))
    .map((item) => ({
      institution: item.institution,
      degree: item.degree,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      description: item.description,
      hidden: Boolean(item.hidden),
    })),
  cvProjects: sections.projects
    .filter((item) => hasAnyValue([item.name, item.role, item.startDate, item.endDate, item.url, item.description]))
    .map((item) => ({
      name: item.name,
      role: item.role,
      startDate: item.startDate,
      endDate: item.endDate,
      url: item.url,
      description: item.description,
      hidden: Boolean(item.hidden),
    })),
  cvSkills: sections.skills
    .filter((item) => hasAnyValue([item.name, item.level]))
    .map((item) => ({
      name: item.name,
      level: item.level,
      hidden: Boolean(item.hidden),
    })),
  cvLanguages: sections.languages
    .filter((item) => hasAnyValue([item.name, item.level]))
    .map((item) => ({
      name: item.name,
      level: item.level,
      hidden: Boolean(item.hidden),
    })),
});

export const CvEditorProfile = () => {
  const { auth, token, sessionVersion } = useAuth();
  const navigate = useNavigate();
  const [cvSections, setCvSections] = useState<CvSections>(emptyCvSections);
  const [activeTheme, setActiveTheme] = useState<CvAccentTheme>('graphite');
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [selectedCareerIds, setSelectedCareerIds] = useState<number[]>([]);
  const [careerSelectionError, setCareerSelectionError] = useState('');
  const [editorPhase, setEditorPhase] = useState<ProfileEditorPhase>('loading');
  const [editorError, setEditorError] = useState('');
  const [hydratedSessionKey, setHydratedSessionKey] = useState<string | null>(null);
  const [persistedAvatarUrl, setPersistedAvatarUrl] = useState('');
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
  const [avatarStorageMode, setAvatarStorageMode] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);
  const [avatarEditorSource, setAvatarEditorSource] = useState<string | null>(null);
  const [avatarEditorFileName, setAvatarEditorFileName] = useState('');
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
  const resumeRef = useRef<HTMLElement>(null);
  const dirtyRef = useRef(false);
  const fileReaderRef = useRef<FileReader | null>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const {
    printCv,
    isPrinting,
    printError,
  } = useCvAtsPrint({
    contentRef: resumeRef,
    documentTitle: auth?.fullName ? `CV-${auth.fullName}-OneITB` : 'OneITB-CV-ATS',
  });

  const {
    data: gqlData,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery(GET_USER_PROFILE, {
    fetchPolicy: 'network-only',
    skip: !auth?.id,
    notifyOnNetworkStatusChange: true,
    context: { sessionVersion },
  });
  const {
    data: careersData,
    loading: careersLoading,
    error: careersError,
    refetch: refetchCareers,
  } = useQuery(GET_CAREERS, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    skip: !auth?.id,
    notifyOnNetworkStatusChange: true,
    context: { sessionVersion },
  });
  const [updateProfile, { loading: savingProfile }] = useMutation(UPDATE_PROFILE);
  const [toggleProfilePrivacy, { loading: savingPrivacy }] = useMutation(TOGGLE_PROFILE_PRIVACY);

  const sessionKey = buildProfileSessionKey(auth?.id, sessionVersion);
  const sessionProfile = getMatchingProfile(auth?.id, gqlData?.me);
  const editorIsReady = Boolean(
    sessionKey
    && hydratedSessionKey === sessionKey
    && sessionProfile,
  );

  const markDirty = () => {
    dirtyRef.current = true;
    setEditorPhase('dirty');
    setSaveStatus('idle');
    setEditorError('');
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    uploadAbortRef.current?.abort();
    uploadAbortRef.current = null;
    if (fileReaderRef.current?.readyState === FileReader.LOADING) {
      fileReaderRef.current.abort();
    }
    fileReaderRef.current = null;
    dirtyRef.current = false;
    setHydratedSessionKey(null);
    setEditorPhase('loading');
    setEditorError('');
    setSaveStatus('idle');
    setUploadStatus('idle');
    setPendingAvatarUrl(null);
    setAvatarStorageMode(null);
    setAvatarEditorOpen(false);
    setAvatarEditorSource(null);
    setAvatarEditorFileName('');
  }, [sessionKey]);

  useEffect(() => () => {
    uploadAbortRef.current?.abort();
    if (fileReaderRef.current?.readyState === FileReader.LOADING) {
      fileReaderRef.current.abort();
    }
  }, []);

  useEffect(() => {
    setAvatarImageFailed(false);
  }, [avatarPreview]);

  useEffect(() => {
    if (!sessionKey || profileLoading || careersLoading) return;
    if (profileError || careersError || !sessionProfile) {
      setEditorPhase('error');
      setEditorError(
        sessionProfile
          ? 'No se pudo cargar la configuracion completa del perfil.'
          : 'El perfil recibido no corresponde a la sesion actual.',
      );
      return;
    }
    if (hydratedSessionKey === sessionKey || dirtyRef.current) return;

    const snapshot = createProfileEditorSnapshot(sessionProfile);
    setProfileForm(snapshot.profileForm);
    setSelectedCareerIds(snapshot.careerIds);
    setCvSections(snapshot.cvSections);
    setPersistedAvatarUrl(snapshot.persistedAvatarUrl);
    setPendingAvatarUrl(null);
    setAvatarPreview(snapshot.persistedAvatarUrl || null);
    setHydratedSessionKey(sessionKey);
    setEditorPhase('ready');
  }, [
    careersError,
    careersLoading,
    hydratedSessionKey,
    profileError,
    profileLoading,
    sessionKey,
    sessionProfile,
  ]);

  const handleProfileChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    markDirty();
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handlePrivacyChange = () => {
    markDirty();
    setProfileForm((current) => ({
      ...current,
      isPublicProfile: !current.isPublicProfile,
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadStatus('error');
      setSaveStatus('error');
      setEditorError('Selecciona una imagen valida para el avatar.');
      event.target.value = '';
      return;
    }

    if (fileReaderRef.current?.readyState === FileReader.LOADING) {
      fileReaderRef.current.abort();
    }
    const reader = new FileReader();
    fileReaderRef.current = reader;
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarEditorSource(reader.result);
        setAvatarEditorFileName(file.name);
        setAvatarEditorOpen(true);
        setUploadStatus('idle');
        setSaveStatus('idle');
      }
      fileReaderRef.current = null;
    };
    reader.onerror = () => {
      fileReaderRef.current = null;
      setUploadStatus('error');
      setSaveStatus('error');
      setEditorError('No se pudo leer la imagen seleccionada.');
    };
    reader.onabort = () => {
      fileReaderRef.current = null;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleAvatarEditorClose = () => {
    if (uploadStatus === 'uploading') return;
    setAvatarEditorOpen(false);
    setAvatarEditorSource(null);
    setAvatarEditorFileName('');
  };

  const handleAvatarEditorSave = async (editedFile: File) => {
    uploadAbortRef.current?.abort();
    const abortController = new AbortController();
    uploadAbortRef.current = abortController;

    try {
      setUploadStatus('uploading');
      setEditorPhase('uploading-avatar');
      setSaveStatus('idle');
      setEditorError('');
      const descriptor = await uploadAttachmentDescriptor(
        editedFile,
        token,
        { signal: abortController.signal },
      );
      if (!descriptor?.fileUrl) {
        throw new Error('UPLOAD_URL_MISSING');
      }

      setPendingAvatarUrl(descriptor.fileUrl);
      setAvatarStorageMode(descriptor.storageMode || null);
      setProfileForm((current) => ({ ...current, avatarUrl: descriptor.fileUrl }));
      setAvatarPreview(descriptor.fileUrl);
      setUploadStatus('idle');
      dirtyRef.current = true;
      setEditorPhase('dirty');
      setAvatarEditorOpen(false);
      setAvatarEditorSource(null);
      setAvatarEditorFileName('');
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      setUploadStatus('error');
      setSaveStatus('error');
      setEditorPhase('error');
      setEditorError(
        'No se pudo almacenar la nueva imagen. El avatar anterior sigue intacto.',
      );
      setAvatarPreview(pendingAvatarUrl || persistedAvatarUrl || null);
    } finally {
      if (uploadAbortRef.current === abortController) {
        uploadAbortRef.current = null;
      }
    }
  };

  const handleToggleCareer = (careerId: number) => {
    markDirty();
    setCareerSelectionError('');
    const role = sessionProfile?.role;
    setSelectedCareerIds((current) => selectCareerForRole(role, current, careerId));
  };

  const updateCvSection = <K extends keyof CvSections>(
    section: K,
    value: CvSections[K],
  ) => {
    markDirty();
    setCvSections((current) => ({ ...current, [section]: value }));
  };

  const handleSaveProfile = async () => {
    const currentProfile = sessionProfile;
    const userId = currentProfile?.id;
    if (!currentProfile || !userId || !editorIsReady) {
      setSaveStatus('error');
      setEditorPhase('error');
      setEditorError('El perfil completo no esta disponible para guardar.');
      return;
    }

    const role = currentProfile.role;
    const selectionError = validateCareerSelectionForRole(role, selectedCareerIds);
    if (selectionError) {
      setCareerSelectionError(selectionError);
      setSaveStatus('error');
      setEditorPhase('error');
      return;
    }

    const effectiveAvatarUrl = pendingAvatarUrl || persistedAvatarUrl || null;

    try {
      setEditorPhase('saving-profile');
      setEditorError('');
      const response = await updateProfile({
        variables: {
          input: {
            id: userId,
            biography: profileForm.biography,
            phone: profileForm.phone,
            linkedIn: profileForm.linkedIn,
            facebook: profileForm.facebook,
            instagram: profileForm.instagram,
            avatarUrl: effectiveAvatarUrl,
            careerIds: selectedCareerIds,
            ...buildCvInput(cvSections),
          },
        },
      });

      if (!response.data?.updateProfile?.success) {
        throw new Error('PROFILE_UPDATE_REJECTED');
      }

      const currentPrivacy = currentProfile.isPublicProfile ?? true;
      if (currentPrivacy !== profileForm.isPublicProfile) {
        const privacyResponse = await toggleProfilePrivacy({
          variables: { isPublic: profileForm.isPublicProfile },
        });

        if (!privacyResponse.data?.toggleProfilePrivacy?.success) {
          throw new Error('PROFILE_PRIVACY_REJECTED');
        }

        emitProfilePrivacyToast(profileForm.isPublicProfile);
      }

      const refreshed = await refetchProfile();
      const confirmedProfile = getMatchingProfile(auth?.id, refreshed.data?.me);
      if (!confirmedProfile) {
        throw new Error('PROFILE_REFETCH_MISMATCH');
      }
      if ((confirmedProfile.avatarUrl || '') !== (effectiveAvatarUrl || '')) {
        throw new Error('AVATAR_ASSOCIATION_NOT_CONFIRMED');
      }

      dirtyRef.current = false;
      setPendingAvatarUrl(null);
      setPersistedAvatarUrl(confirmedProfile.avatarUrl || '');
      setSaveStatus('saved');
      setEditorPhase('saved');
      navigate('/profile', { replace: true });
    } catch {
      setSaveStatus('error');
      setEditorPhase('error');
      setEditorError(
        pendingAvatarUrl
          ? 'La imagen fue almacenada, pero el perfil no confirmo la asociacion. Podes reintentar sin volver a editarla.'
          : 'No se pudo guardar el perfil. Tus cambios permanecen en el formulario para reintentar.',
      );
    }
  };

  const handleCancel = () => {
    uploadAbortRef.current?.abort();
    navigate('/profile');
  };

  const handleRetryLoad = async () => {
    dirtyRef.current = false;
    setEditorPhase('loading');
    setEditorError('');
    setHydratedSessionKey(null);
    try {
      await Promise.all([refetchProfile(), refetchCareers()]);
    } catch {
      setEditorPhase('error');
      setEditorError('No se pudo recuperar el perfil. Verifica la conexion e intenta nuevamente.');
    }
  };

  if (!editorIsReady && (profileLoading || careersLoading || editorPhase === 'loading')) {
    return <ProfileEditorSkeleton />;
  }

  if (!editorIsReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <section className="w-full max-w-lg rounded-3xl border border-amber-200 bg-amber-50 p-7 shadow-sm dark:border-amber-300/20 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">
            Perfil no disponible
          </p>
          <h1 className="mt-3 text-xl font-black text-slate-950 dark:text-slate-50">
            No pudimos cargar una edicion segura
          </h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
            {editorError || 'Los datos recibidos no corresponden a la sesion actual.'}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={handleRetryLoad}>Reintentar</Button>
            <Button type="button" variant="secondary" onClick={handleCancel}>Volver al perfil</Button>
          </div>
        </section>
      </main>
    );
  }

  const currentProfile = sessionProfile!;
  const displayName = currentProfile.fullName || `${currentProfile.firstName || ''} ${currentProfile.lastName || ''}`.trim();
  const rawDisplayRole = currentProfile.role || '';
  const displayRole = rawDisplayRole.toLowerCase() === 'user' ? '' : rawDisplayRole;
  const displayEmail = currentProfile.email || '';
  const selectedCareerNames = (careersData?.careers ?? [])
    .filter((career: any) => selectedCareerIds.includes(career.id))
    .map((career: any) => career.name)
    .filter(Boolean);

  const previewData: CVData = {
    personalInfo: {
      name: displayName,
      title: displayRole,
      email: displayEmail,
      phone: profileForm.phone,
      location: selectedCareerNames.join(' / '),
      linkedin: profileForm.linkedIn,
      github: '',
      website:
        normalizeExternalUrl(profileForm.facebook, 'facebook') ||
        normalizeExternalUrl(profileForm.instagram, 'instagram') ||
        '',
      profileImage: resolveAssetUrl(avatarPreview || persistedAvatarUrl),
    },
    summary: profileForm.biography,
    ...cvSections,
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 dark:[&_input]:border-white/10 dark:[&_input]:bg-slate-950/80 dark:[&_input]:text-slate-100 dark:[&_input]:placeholder:text-slate-500 dark:[&_textarea]:border-white/10 dark:[&_textarea]:bg-slate-950/80 dark:[&_textarea]:text-slate-100 dark:[&_textarea]:placeholder:text-slate-500 dark:[&_select]:border-white/10 dark:[&_select]:bg-slate-950/80 dark:[&_select]:text-slate-100 dark:[&_label]:text-slate-200 print:block print:min-h-0 print:bg-white print:text-black">
      <main className="grid h-[calc(100vh-56px)] flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2 print:block print:h-auto print:overflow-visible">
        <section className="no-print space-y-6 overflow-y-auto p-4 md:p-6 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
            <div>
              <h1 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-blue-200">
                Edicion del Curriculum
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Perfil y CV extendido guardados como una unica estructura institucional.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded border border-slate-200/80 bg-white px-1.5 py-0.5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                {[
                  ['graphite', 'bg-slate-500'],
                  ['deepTeal', 'bg-teal-800'],
                  ['navyInk', 'bg-indigo-950'],
                  ['mutedOlive', 'bg-emerald-800'],
                ].map(([theme, color]) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setActiveTheme(theme as CvAccentTheme)}
                    className={`h-3 w-3 rounded-full ${color} transition hover:scale-110 ${
                      activeTheme === theme ? 'scale-105 ring-1 ring-slate-800 ring-offset-2' : 'opacity-85'
                    }`}
                    aria-label={`Tema ${theme}`}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={printCv}
                disabled={isPrinting}
                className="!border-slate-700 !bg-slate-800 !text-white hover:!bg-slate-700"
              >
                {isPrinting ? 'Preparando...' : 'PDF optimizado para ATS'}
              </Button>
            </div>
          </div>
          {printError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-300/20 dark:bg-red-500/10 dark:text-red-200">
              {printError}
            </p>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_18px_45px_rgba(2,6,23,0.35)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-900 text-white shadow-sm dark:ring-1 dark:ring-white/10">
                  {avatarPreview && !avatarImageFailed ? (
                    <img
                      src={resolveAssetUrl(avatarPreview)}
                      alt="Vista previa del avatar"
                      className="h-full w-full object-cover"
                      onError={() => setAvatarImageFailed(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">{displayName}</p>
                  {displayRole && <p className="text-sm text-slate-500 dark:text-slate-400">{displayRole}</p>}
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-blue-300/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-200">
                    <i className="fa-solid fa-camera" />
                    {uploadStatus === 'uploading' ? 'Subiendo avatar...' : 'Subir avatar'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={uploadStatus === 'uploading'}
                    />
                  </label>
                  {uploadStatus === 'error' ? (
                    <p className="mt-1 text-[11px] font-semibold text-red-500">
                      No se pudo subir la imagen. El avatar guardado no fue reemplazado.
                    </p>
                  ) : pendingAvatarUrl ? (
                    <p className="mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-200">
                      Imagen almacenada{avatarStorageMode ? ` en modo ${avatarStorageMode === 'Cloudinary' ? 'Cloudinary' : 'local'}` : ''}; falta guardar el perfil.
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                      Primero se almacena la imagen y luego se confirma al guardar el perfil.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCancel}
                  disabled={savingProfile || savingPrivacy}
                  className="!border-slate-200 !bg-white !text-slate-700 hover:!bg-slate-50 disabled:!cursor-not-allowed disabled:!opacity-60 dark:!border-white/10 dark:!bg-slate-900 dark:!text-slate-200 dark:hover:!bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={savingProfile || savingPrivacy || profileLoading || uploadStatus === 'uploading' || editorPhase === 'saving-profile'}
                  className="!bg-blue-700 !text-white hover:!bg-blue-800 disabled:!cursor-not-allowed disabled:!opacity-60"
                >
                  {savingProfile || savingPrivacy ? 'Guardando...' : 'Guardar perfil y CV'}
                </Button>
              </div>
            </div>

            {saveStatus === 'saved' && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Perfil, CV y preferencias actualizados correctamente.
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
                {careerSelectionError || editorError || 'No se pudo guardar el perfil. Revisa tu sesion e intentalo nuevamente.'}
              </div>
            )}

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/60">
                <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-blue-300/20 dark:bg-slate-900/80 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Privacidad del perfil
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {profileForm.isPublicProfile
                        ? 'Tu CV, contacto y trayectoria son visibles para la comunidad.'
                        : 'Solo vos, tus seguidores y el equipo de moderacion pueden ver tu CV y contacto.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePrivacyChange}
                    className={[
                      'relative inline-flex h-8 w-16 shrink-0 items-center rounded-full border p-1 transition',
                      profileForm.isPublicProfile
                        ? 'border-emerald-300 bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.24)]'
                        : 'border-slate-300 bg-slate-300 dark:border-white/10 dark:bg-slate-700',
                    ].join(' ')}
                    aria-pressed={profileForm.isPublicProfile}
                    aria-label="Cambiar privacidad del perfil"
                  >
                    <span
                      className={[
                        'flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] text-slate-700 shadow-sm transition-transform',
                        profileForm.isPublicProfile ? 'translate-x-8' : 'translate-x-0',
                      ].join(' ')}
                    >
                      <i className={profileForm.isPublicProfile ? 'fa-solid fa-globe' : 'fa-solid fa-lock'} />
                    </span>
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Identidad academica
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {currentProfile.role === 'Estudiante'
                        ? 'Selecciona la unica carrera que cursas actualmente.'
                        : 'Selecciona las carreras que deben verse en tu perfil institucional.'}
                    </p>
                  </div>
                  {careersLoading && (
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Cargando...</span>
                  )}
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {(careersData?.careers ?? []).map((career: any) => (
                    <label
                      key={career.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-white bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-blue-300/30 dark:hover:bg-blue-500/10"
                    >
                      <input
                        type={currentProfile.role === 'Estudiante' ? 'radio' : 'checkbox'}
                        name={currentProfile.role === 'Estudiante' ? 'profile-career' : undefined}
                        checked={selectedCareerIds.includes(career.id)}
                        onChange={() => handleToggleCareer(career.id)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                      />
                      <span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{career.name}</span>
                        {career.code && <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">({career.code})</span>}
                      </span>
                    </label>
                  ))}
                </div>
                {!careersLoading && (careersData?.careers ?? []).length === 0 && (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No hay carreras activas disponibles.</p>
                )}
              </div>

              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Biografia profesional
                </span>
                <textarea
                  name="biography"
                  value={profileForm.biography}
                  onChange={handleProfileChange}
                  rows={4}
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Describe tu perfil academico, experiencia y objetivos."
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Telefono</span>
                  <input
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="+54 9 11 1234-5678"
                  />
                </label>
                <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">LinkedIn</span>
                  <input
                    name="linkedIn"
                    value={profileForm.linkedIn}
                    onChange={handleProfileChange}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="https://linkedin.com/in/usuario"
                  />
                </label>
                <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Instagram</span>
                  <input
                    name="instagram"
                    value={profileForm.instagram}
                    onChange={handleProfileChange}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="https://instagram.com/usuario"
                  />
                </label>
                <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Facebook</span>
                  <input
                    name="facebook"
                    value={profileForm.facebook}
                    onChange={handleProfileChange}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="https://facebook.com/usuario"
                  />
                </label>
              </div>
            </div>
          </section>

          <ExperienceForm
            experience={cvSections.experience}
            onChangeExperience={(experience) => updateCvSection('experience', experience)}
          />
          <EducationForm
            education={cvSections.education}
            onChangeEducation={(education) => updateCvSection('education', education)}
          />
          <ProjectsForm
            projects={cvSections.projects}
            onChangeProjects={(projects) => updateCvSection('projects', projects)}
          />
          <SkillsLanguagesForm
            skills={cvSections.skills}
            onChangeSkills={(skills) => updateCvSection('skills', skills)}
            languages={cvSections.languages}
            onChangeLanguages={(languages) => updateCvSection('languages', languages)}
          />
        </section>

        <section className="no-print overflow-y-auto border-t border-slate-200 bg-slate-200/50 p-4 dark:border-white/10 dark:bg-slate-900/60 sm:p-6 lg:border-l lg:border-t-0">
          <div className="mx-auto mb-4 max-w-[210mm] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300">
            Esta previsualización conserva una única columna y texto seleccionable. El avatar y los adornos no forman parte del PDF optimizado para ATS.
          </div>
          <CVATSPrintTemplate ref={resumeRef} data={previewData} activeTheme={activeTheme} />
        </section>
      </main>

      <AvatarEditorModal
        isOpen={avatarEditorOpen}
        imageSrc={avatarEditorSource}
        originalFileName={avatarEditorFileName}
        onClose={handleAvatarEditorClose}
        onSave={handleAvatarEditorSave}
        saving={uploadStatus === 'uploading'}
      />
    </div>
  );
};
