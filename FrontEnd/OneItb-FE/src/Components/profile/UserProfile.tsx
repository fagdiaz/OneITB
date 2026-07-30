import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import useAuth from '../../hooks/useAuth';
import { GET_PUBLIC_PROFILE } from '../../data/graphql/queries/publicProfile';
import { GET_MY_ACADEMIC_PROGRESS } from '../../data/graphql/queries/academic';
import { apiBaseUrl } from '../../utils/uploadFile';
import { CVPrintTemplate } from '../resume/CVPrintTemplate';
import { CVData } from '../../types/resume';
import { GET_MY_FOLLOWED_USER_IDS } from '../../data/graphql/social';
import { FollowButton } from '../social/FollowButton';
import { useInquiryPage } from '../../hooks/useInquiryPage';

const roleStyles: Record<string, string> = {
  Administrador: 'bg-blue-50 text-blue-800 ring-blue-200',
  Moderador: 'bg-violet-50 text-violet-800 ring-violet-200',
  Profesor: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Egresado: 'bg-amber-50 text-amber-800 ring-amber-200',
  Estudiante: 'bg-sky-50 text-sky-800 ring-sky-200',
};

const statusLabels: Record<string, string> = {
  APPROVED: 'Aprobadas',
  REGULAR: 'Regulares',
  IN_PROGRESS: 'En curso',
  FREE: 'Libres',
};

const normalizeExternalUrl = (value?: string | null, provider?: 'linkedin' | 'instagram' | 'facebook') => {
  const raw = value?.trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) return raw;

  const cleaned = raw.replace(/^@/, '').replace(/^\/+/, '');
  if (cleaned.includes('.')) return `https://${cleaned}`;

  if (provider === 'linkedin') return `https://www.linkedin.com/in/${cleaned}`;
  if (provider === 'instagram') return `https://www.instagram.com/${cleaned}`;
  if (provider === 'facebook') return `https://www.facebook.com/${cleaned}`;

  return `https://${cleaned}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin actividad reciente';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Sin actividad reciente';
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
};

const getInitials = (fullName: string) => {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

const resolveAssetUrl = (value?: string | null): string | null => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  if (value.startsWith('/')) return `${apiBaseUrl}${value}`;
  return value;
};

const getWhatsappUrl = (value?: string | null): string | null => {
  const digits = value?.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
};

const pluralize = (count: number | null, singular: string, plural: string) => {
  if (count === null) return plural;
  return count === 1 ? singular : plural;
};

export const UserProfile = () => {
  const { auth } = useAuth();
  const { id } = useParams();
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [followOverride, setFollowOverride] = useState<boolean | null>(null);

  const targetUserId = id || auth.id;
  const isOwnProfile = Boolean(auth?.id && targetUserId && String(auth.id).toLowerCase() === String(targetUserId).toLowerCase());

  const { data, loading, error } = useQuery(GET_PUBLIC_PROFILE, {
    variables: { userId: targetUserId },
    skip: !targetUserId,
    fetchPolicy: 'cache-and-network',
  });

  const {
    items: userPosts,
    loading: userPostsLoading,
    loadingMore: loadingMorePosts,
    hasNextPage: hasMorePosts,
    loadMore: loadMorePosts,
  } = useInquiryPage({
    authorId: targetUserId,
    pageSize: 8,
    skip: !auth.id || !targetUserId,
  });

  const { data: progressData, error: progressError } = useQuery(GET_MY_ACADEMIC_PROGRESS, {
    skip: !isOwnProfile,
    fetchPolicy: 'cache-and-network',
  });
  const { data: followedData } = useQuery(GET_MY_FOLLOWED_USER_IDS, {
    skip: !auth?.id || isOwnProfile,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    setFollowOverride(null);
    setShowAllPosts(false);
  }, [targetUserId]);

  const profile = data?.publicProfile;
  const canViewSensitiveProfile = profile?.canViewSensitiveProfile !== false;
  const isFollowing = followOverride ?? Boolean(targetUserId && followedData?.myFollowedUserIds?.includes(targetUserId));

  const visiblePosts = canViewSensitiveProfile
    ? showAllPosts
      ? userPosts
      : userPosts.slice(0, 4)
    : [];

  const activitySubjects = useMemo(() => {
    const names = userPosts
      .map((post: any) => post.subject?.name)
      .filter(Boolean);
    return Array.from(new Set(names)).slice(0, 8);
  }, [userPosts]);

  const latestActivity = userPosts[0]?.publishDate;
  const progressItems = progressData?.myAcademicProgress ?? [];

  const academicMetrics = useMemo(() => {
    return progressItems.reduce(
      (acc: Record<string, number>, item: any) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        return acc;
      },
      {},
    );
  }, [progressItems]);

  const highlightedProgress = progressItems.slice(0, 4);
  const approvedSubjectsCount = isOwnProfile
    ? progressItems.filter((item: any) => item.status === 'APPROVED').length
    : null;

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center py-20 text-sm font-semibold text-slate-500">
        Cargando perfil profesional...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
          No se pudo cargar el perfil.
        </div>
      </div>
    );
  }

  const biography = canViewSensitiveProfile
    ? profile.biography || 'Este perfil todavia no tiene una presentacion profesional cargada.'
    : 'Este perfil esta configurado como privado. Solo el titular, sus seguidores y el equipo institucional pueden ver el CV, contacto y trayectoria.';
  const careers = profile.careers ?? [];
  const roleClass = roleStyles[profile.role] ?? 'bg-slate-100 text-slate-700 ring-slate-200';
  const avatarUrl = resolveAssetUrl(profile.avatarUrl) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=0f172a&color=fff&size=192`;
  const sortVisibleCvItems = (items?: any[]) =>
    [...(items ?? [])]
      .filter((item) => !item.hidden)
      .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
  const cvExperiences = sortVisibleCvItems(profile.cvExperiences);
  const cvEducations = sortVisibleCvItems(profile.cvEducations);
  const cvProjects = sortVisibleCvItems(profile.cvProjects);
  const cvSkills = sortVisibleCvItems(profile.cvSkills);
  const cvLanguages = sortVisibleCvItems(profile.cvLanguages);
  const hasExtendedCv =
    cvExperiences.length > 0 ||
    cvEducations.length > 0 ||
    cvProjects.length > 0 ||
    cvSkills.length > 0 ||
    cvLanguages.length > 0;
  const totalPublications = profile.totalPublications ?? userPosts.length;
  const totalComments = profile.totalComments ?? 0;
  const communityContributions = totalPublications + totalComments;
  const whatsappHref = getWhatsappUrl(profile.phone);
  const handleEditProfileNavigation = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };
  const printCvData: CVData = {
    personalInfo: {
      name: profile.fullName || 'Usuario OneITB',
      title: profile.role && profile.role.toLowerCase() !== 'user' ? profile.role : '',
      email: isOwnProfile ? (auth?.email || '') : '',
      phone: profile.phone || '',
      location: careers.length > 0 ? careers.join(' / ') : '',
      linkedin: profile.linkedIn || '',
      github: '',
      website:
        normalizeExternalUrl(profile.facebook, 'facebook') ||
        normalizeExternalUrl(profile.instagram, 'instagram') ||
        '',
      profileImage: avatarUrl,
    },
    summary: biography,
    experience: cvExperiences.map((item: any) => ({
      id: String(item.id),
      company: item.company || '',
      role: item.role || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      location: item.location || '',
      description: item.description || '',
      hidden: Boolean(item.hidden),
    })),
    education: cvEducations.map((item: any) => ({
      id: String(item.id),
      institution: item.institution || '',
      degree: item.degree || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      location: item.location || '',
      description: item.description || '',
      hidden: Boolean(item.hidden),
    })),
    projects: cvProjects.map((item: any) => ({
      id: String(item.id),
      name: item.name || '',
      role: item.role || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      url: item.url || '',
      description: item.description || '',
      hidden: Boolean(item.hidden),
    })),
    skills: cvSkills.map((item: any) => ({
      id: String(item.id),
      name: item.name || '',
      level: item.level || '',
      hidden: Boolean(item.hidden),
    })),
    languages: cvLanguages.map((item: any) => ({
      id: String(item.id),
      name: item.name || '',
      level: item.level || '',
      hidden: Boolean(item.hidden),
    })),
  };

  const socialLinks = [
    {
      label: 'LinkedIn',
      value: profile.linkedIn,
      href: normalizeExternalUrl(profile.linkedIn, 'linkedin'),
      icon: 'fa-brands fa-linkedin-in',
      color: 'text-blue-700',
    },
    {
      label: 'Instagram',
      value: profile.instagram,
      href: normalizeExternalUrl(profile.instagram, 'instagram'),
      icon: 'fa-brands fa-instagram',
      color: 'text-pink-600',
    },
    {
      label: 'Facebook',
      value: profile.facebook,
      href: normalizeExternalUrl(profile.facebook, 'facebook'),
      icon: 'fa-brands fa-facebook-f',
      color: 'text-blue-600',
    },
  ].filter((item) => item.value && item.href);

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 print:bg-white print:text-black print:m-0 print:overflow-hidden">
      <div className="print:hidden">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 print:max-w-full print:space-y-0 print:p-0 print:m-0 print:overflow-hidden">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/70 print:rounded-none print:border-0 print:bg-white print:shadow-none">
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 px-6 py-8 text-white sm:px-8 print:bg-white print:text-slate-950 print:border-b print:border-slate-300 print:px-0 print:py-4">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="relative h-36 w-36 shrink-0 print:-ml-2">
                  <img
                    src={avatarUrl}
                    className="h-36 w-36 rounded-3xl border-4 border-white/20 object-cover shadow-2xl"
                    alt={`Avatar de ${profile.fullName}`}
                  />
                  <div className="absolute -bottom-3 -right-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black text-slate-950 shadow-lg">
                    {getInitials(profile.fullName)}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-blue-200 print:text-blue-700">Curriculum institucional</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl print:text-slate-950">{profile.fullName}</h1>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {profile.role && profile.role.toLowerCase() !== 'user' && (
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${roleClass}`}>
                        {profile.role}
                      </span>
                    )}
                    {isOwnProfile && profile.institutionalAccountLinked && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-100 ring-1 ring-emerald-300/30 print:bg-emerald-50 print:text-emerald-800 print:ring-emerald-200">
                        <i className="fa-brands fa-microsoft" aria-hidden="true" />
                        Cuenta institucional vinculada
                      </span>
                    )}
                    {careers.slice(0, 2).map((career: string) => (
                      <span key={career} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100 ring-1 ring-white/15 print:bg-slate-100 print:text-slate-700 print:ring-slate-300">
                        {career}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <div className="flex items-center gap-3 print:hidden">
                  <button
                    type="button"
                    onClick={() => setShowPrintPreview(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-white/20"
                  >
                    <i className="fa-solid fa-print" />
                    Imprimir CV
                  </button>
                  <Link
                    to="/profile/edit"
                    onClick={handleEditProfileNavigation}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-blue-50"
                  >
                    <i className="fa-solid fa-pen-to-square" />
                    Editar CV/Perfil
                  </Link>
                </div>
              )}
              {!isOwnProfile && targetUserId && (
                <div className="flex items-center print:hidden">
                  <FollowButton
                    targetUserId={targetUserId}
                    isFollowing={isFollowing}
                    onStateChange={(_, nextState) => setFollowOverride(nextState)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.5fr_0.9fr] print:block print:p-0 print:gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/50">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Perfil profesional</p>
              <p className="mt-3 text-base leading-8 text-slate-700 dark:text-slate-300">{biography}</p>
              {!canViewSensitiveProfile && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-300/20 dark:bg-amber-500/10 dark:text-amber-100">
                  <i className="fa-solid fa-lock mr-2" />
                  Perfil privado: la informacion sensible esta protegida.
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50 print:shadow-none print:bg-transparent print:border-slate-300">
                <p className="text-2xl font-black text-slate-950 print:text-black">{communityContributions || '—'}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 print:text-slate-700">
                  {pluralize(communityContributions, 'Aporte en la Comunidad', 'Aportes en la Comunidad')}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  {totalPublications} {pluralize(totalPublications, 'Publicacion', 'Publicaciones')} · {totalComments} {pluralize(totalComments, 'Comentario', 'Comentarios')}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50 print:shadow-none print:bg-transparent print:border-slate-300">
                <p className="text-2xl font-black text-slate-950 print:text-black">{approvedSubjectsCount ?? '—'}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 print:text-slate-700">
                  {pluralize(approvedSubjectsCount, 'Materia Aprobada', 'Materias Aprobadas')}
                </p>
                {!isOwnProfile && (
                  <p className="mt-1 text-[11px] font-medium text-slate-400">Visible solo para el perfil propio.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr] print:block print:gap-4">
          <aside className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 print:rounded-none print:border-0 print:border-b print:bg-white print:p-0 print:pb-4 print:shadow-none">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Contacto y redes</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">Canales profesionales</h2>
                </div>
                <i className="fa-solid fa-address-card text-2xl text-slate-300" />
              </div>

              <div className="mt-5 space-y-3">
                {profile.phone && (
                  <a
                    href={whatsappHref ?? `tel:${profile.phone}`}
                    target={whatsappHref ? '_blank' : undefined}
                    rel={whatsappHref ? 'noreferrer' : undefined}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:border-blue-300/20 dark:hover:bg-blue-500/10"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm dark:bg-slate-900">
                      <i className="fa-brands fa-whatsapp" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">WhatsApp</span>
                      <span className="block truncate text-xs font-normal text-slate-500 print:truncate-none print:whitespace-normal">
                        {profile.phone}
                      </span>
                    </span>
                  </a>
                )}

                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:border-blue-300/20 dark:hover:bg-blue-500/10"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${item.color}`}>
                      <i className={item.icon} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{item.label}</span>
                      <span className="block truncate text-xs font-normal text-slate-500 print:truncate-none print:whitespace-normal">
                        {item.href}
                      </span>
                    </span>
                    <i className="fa-solid fa-arrow-up-right-from-square ml-auto shrink-0 text-xs text-slate-400 print:hidden" />
                  </a>
                ))}

                {!profile.phone && socialLinks.length === 0 && (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Sin canales de contacto cargados.</p>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Identidad academica</p>
              <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">Carreras</h2>
              <div className="mt-5 space-y-3">
                {careers.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Sin carrera asociada.</p>
                ) : (
                  careers.map((career: string) => (
                    <div key={career} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/50">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
                        {career
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join('')}
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{career}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>

          <main className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Educacion / Trayectoria</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Recorrido academico</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Resumen publico basado en carreras y participacion por materia.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right dark:bg-slate-950/50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ultima actividad</p>
                  <p className="text-sm font-bold text-slate-800">{formatDate(latestActivity)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/50">
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Materias destacadas</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activitySubjects.length === 0 ? (
                      <span className="text-sm text-slate-500">Sin actividad publica por materia.</span>
                    ) : (
                      activitySubjects.map((subject) => (
                        <span key={subject} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                          {subject}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/50">
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Sintesis institucional</h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-white/10">
                      <p className="font-black text-slate-950">{careers.length || '-'}</p>
                      <p className="text-xs text-slate-500">Carreras activas</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-white/10">
                      <p className="font-black text-slate-950">{activitySubjects.length || '-'}</p>
                      <p className="text-xs text-slate-500">Areas de actividad</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">CV extendido</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Trayectoria profesional y academica</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Informacion estructurada del curriculum institucional del perfil.
                  </p>
                </div>
                {isOwnProfile && (
                  <Link
                    to="/profile/edit"
                    onClick={handleEditProfileNavigation}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-800 transition hover:bg-blue-100 print:hidden"
                  >
                    <i className="fa-solid fa-file-pen" />
                    Editar CV
                  </Link>
                )}
              </div>

              {!hasExtendedCv ? (
                <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                  Este perfil todavia no tiene experiencia, formacion o habilidades cargadas en el CV.
                </p>
              ) : (
                <div className="mt-6 grid gap-5">
                  {cvExperiences.length > 0 && (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/50">
                      <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Experiencia</h3>
                      <div className="mt-4 space-y-4">
                        {cvExperiences.map((item) => (
                          <div key={item.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-white/10">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-base font-black text-slate-950 dark:text-white">{item.role}</p>
                                <p className="text-sm font-semibold text-blue-700">{item.company}</p>
                              </div>
                              <p className="text-xs font-semibold text-slate-400">
                                {[item.startDate, item.endDate].filter(Boolean).join(' - ')}
                              </p>
                            </div>
                            {item.location && <p className="mt-2 text-xs font-semibold text-slate-500">{item.location}</p>}
                            {item.description && <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cvEducations.length > 0 && (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/50">
                      <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Formacion</h3>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {cvEducations.map((item) => (
                          <div key={item.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-white/10">
                            <p className="text-base font-black text-slate-950 dark:text-white">{item.degree}</p>
                            <p className="mt-1 text-sm font-semibold text-blue-700">{item.institution}</p>
                            <p className="mt-2 text-xs font-semibold text-slate-400">
                              {[item.startDate, item.endDate].filter(Boolean).join(' - ')}
                            </p>
                            {item.description && <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cvProjects.length > 0 && (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/50">
                      <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Proyectos</h3>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {cvProjects.map((item) => (
                          <div key={item.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100 dark:bg-slate-900/80 dark:ring-white/10">
                            <p className="text-base font-black text-slate-950 dark:text-white">{item.name}</p>
                            {item.role && <p className="mt-1 text-sm font-semibold text-blue-700">{item.role}</p>}
                            {item.description && <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>}
                            {item.url && (
                              <>
                                <a
                                  href={normalizeExternalUrl(item.url) ?? item.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 print:hidden"
                                >
                                  Ver proyecto
                                  <i className="fa-solid fa-arrow-up-right-from-square" />
                                </a>
                                <span className="mt-2 hidden text-xs text-slate-500 print:block">
                                  {normalizeExternalUrl(item.url) ?? item.url}
                                </span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(cvSkills.length > 0 || cvLanguages.length > 0) && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/50">
                        <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Habilidades</h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {cvSkills.length === 0 ? (
                            <span className="text-sm text-slate-500">Sin habilidades cargadas.</span>
                          ) : (
                            cvSkills.map((item) => (
                              <span key={item.id} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-white/10">
                                {item.name}{item.level ? ` · ${item.level}` : ''}
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/50">
                        <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Idiomas</h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {cvLanguages.length === 0 ? (
                            <span className="text-sm text-slate-500">Sin idiomas cargados.</span>
                          ) : (
                            cvLanguages.map((item) => (
                              <span key={item.id} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-white/10">
                                {item.name}{item.level ? ` · ${item.level}` : ''}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {isOwnProfile && (
              <section className="rounded-3xl border border-blue-100 bg-blue-50/60 p-6 shadow-sm dark:border-blue-300/20 dark:bg-blue-500/10 print:bg-white print:border-slate-200 print:shadow-none">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Vista privada</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Estado academico personal</h2>
                    <p className="mt-2 text-sm text-slate-600">Solo visible cuando estas viendo tu propio perfil.</p>
                  </div>
                  <Link to="/academic" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800">
                    <i className="fa-solid fa-chart-line" />
                    Ver academico
                  </Link>
                </div>

                {progressError ? (
                  <p className="mt-5 rounded-2xl bg-white p-4 text-sm text-slate-600 dark:bg-slate-900/80 dark:text-slate-300">
                    No se pudo cargar el resumen academico privado en este momento.
                  </p>
                ) : progressItems.length === 0 ? (
                  <p className="mt-5 rounded-2xl bg-white p-4 text-sm text-slate-600 dark:bg-slate-900/80 dark:text-slate-300">
                    Todavia no hay progreso academico registrado.
                  </p>
                ) : (
                  <>
                    <div className="mt-5 grid gap-3 sm:grid-cols-4">
                      {['APPROVED', 'REGULAR', 'IN_PROGRESS', 'FREE'].map((status) => (
                        <div key={status} className="rounded-2xl bg-white p-4 ring-1 ring-blue-100 dark:bg-slate-900/80 dark:ring-blue-300/20">
                          <p className="text-2xl font-black text-slate-950 dark:text-white">{academicMetrics[status] ?? 0}</p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{statusLabels[status]}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {highlightedProgress.map((item: any) => (
                        <div key={item.id} className="rounded-2xl bg-white p-4 ring-1 ring-blue-100 dark:bg-slate-900/80 dark:ring-blue-300/20">
                          <p className="text-sm font-black text-slate-900 dark:text-white">{item.subject?.name}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {statusLabels[item.status] ?? item.status}
                            {item.score !== null && item.score !== undefined ? ` · Nota ${item.score}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 print:hidden">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Portfolio social</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Publicaciones recientes</h2>
                </div>
                {(userPosts.length > 4 || hasMorePosts) && (
                  <button
                    type="button"
                    onClick={() => setShowAllPosts((current) => !current)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-white/10 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-200 print:hidden"
                  >
                    {showAllPosts ? 'Ver menos' : 'Ver todas'}
                  </button>
                )}
              </div>

              {userPostsLoading && visiblePosts.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">Cargando publicaciones...</p>
              ) : visiblePosts.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">Todavia no hay publicaciones para mostrar.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {visiblePosts.map((post: any) => (
                    <article key={post.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50/60 dark:border-white/10 dark:bg-slate-950/50 dark:hover:border-blue-300/20 dark:hover:bg-blue-500/10 print:break-inside-avoid print:bg-white print:border-slate-200">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                          {post.subject?.name || 'Publicacion'}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">{formatDate(post.publishDate)}</span>
                      </div>
                      <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">{post.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.content}</p>
                    </article>
                  ))}
                </div>
              )}
              {showAllPosts && hasMorePosts && (
                <button
                  type="button"
                  onClick={loadMorePosts}
                  disabled={loadingMorePosts}
                  className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-200"
                >
                  {loadingMorePosts ? 'Cargando...' : 'Cargar mas publicaciones'}
                </button>
              )}
            </section>
          </main>
        </div>
      </div>
      </div>
      {showPrintPreview && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 p-4 backdrop-blur-sm print:static print:inset-auto print:z-auto print:bg-white print:p-0 print:backdrop-blur-0">
          <div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-100 shadow-2xl print:block print:h-auto print:max-w-none print:overflow-visible print:rounded-none print:border-0 print:bg-white print:shadow-none">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 print:hidden">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Previsualizacion de CV</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">Curriculum institucional listo para imprimir</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintPreview(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-800"
                >
                  <i className="fa-solid fa-print" />
                  Imprimir / PDF
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-slate-200/70 py-6 print:overflow-visible print:bg-white print:py-0">
              <CVPrintTemplate data={printCvData} activeTheme="graphite" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
