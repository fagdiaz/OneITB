import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { GET_USER_PROFILE } from '../../../data/graphql/queries/getUserProfile';
import { apiBaseUrl } from '../../../utils/uploadFile';

const resolveAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return null;
  if (/^https?:\/\//i.test(avatarUrl) || avatarUrl.startsWith('data:')) return avatarUrl;
  return avatarUrl.startsWith('/') ? `${apiBaseUrl}${avatarUrl}` : avatarUrl;
};

const initials = (profile) => (
  `${profile?.firstName?.[0] ?? ''}${profile?.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
);

const quickLinks = [
  { to: '/profile', icon: 'fa-id-card', label: 'Ver perfil' },
  { to: '/profile/edit', icon: 'fa-pen-to-square', label: 'Editar perfil' },
  { to: '/academic', icon: 'fa-graduation-cap', label: 'Modulo academico' },
  { to: '/empleos', icon: 'fa-briefcase', label: 'Empleos' },
];

export const SideBar = () => {
  const { auth } = useAuth();
  const [avatarFailed, setAvatarFailed] = useState(false);
  const { data, loading } = useQuery(GET_USER_PROFILE, {
    skip: !auth?.id,
    fetchPolicy: 'cache-first',
  });

  const profile = data?.me;
  const avatarUrl = resolveAvatarUrl(profile?.avatarUrl);
  const displayName = profile?.fullName
    || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')
    || auth?.username
    || 'Usuario';
  const careers = useMemo(() => (
    (profile?.userCareers ?? [])
      .map((item) => item?.career)
      .filter((career) => career?.isActive)
  ), [profile?.userCareers]);

  useEffect(() => setAvatarFailed(false), [avatarUrl]);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/65">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          Mi cuenta
        </p>

        <div className="mt-4 flex items-center gap-3">
          <Link to="/profile" className="shrink-0" aria-label="Abrir mi perfil">
            {avatarUrl && !avatarFailed ? (
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                loading="lazy"
                decoding="async"
                onError={() => setAvatarFailed(true)}
                className="h-12 w-12 rounded-xl object-cover ring-2 ring-blue-100 dark:ring-blue-400/20"
              />
            ) : (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white shadow-sm">
                {initials(profile)}
              </span>
            )}
          </Link>

          <div className="min-w-0">
            <Link to="/profile" className="block truncate text-sm font-bold text-slate-900 transition hover:text-blue-600 dark:text-white dark:hover:text-blue-300">
              {loading ? 'Cargando perfil...' : displayName}
            </Link>
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {profile?.role || auth?.role || 'Usuario'}
            </p>
          </div>
        </div>

        {careers.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-white/10">
            {careers.map((career) => (
              <span key={career.id} className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                {career.code || career.name}
              </span>
            ))}
          </div>
        )}
      </section>

      <nav aria-label="Accesos rapidos" className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/65">
        <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          Accesos rapidos
        </p>
        <ul className="space-y-1">
          {quickLinks.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-200"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-300">
                  <i className={`fa-solid ${item.icon}`} />
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
