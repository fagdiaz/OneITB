import React, { useEffect, useState } from 'react';
import { apiBaseUrl } from '../../utils/uploadFile';

export const roleStyles = {
  Administrador: {
    name: 'text-indigo-700 dark:text-indigo-200',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:border-transparent dark:bg-indigo-400/15 dark:text-indigo-200',
    label: 'admin',
  },
  Moderador: {
    name: 'text-amber-800 dark:text-amber-200',
    badge: 'bg-amber-50 text-amber-800 border border-amber-200/60 dark:border-transparent dark:bg-amber-400/15 dark:text-amber-200',
    label: 'moderador',
  },
  Profesor: {
    name: 'text-emerald-700 dark:text-emerald-200',
    badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-200',
    label: 'profesor',
  },
  Estudiante: {
    name: 'text-blue-700 dark:text-sky-200',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200/60 dark:border-transparent dark:bg-sky-400/15 dark:text-sky-200',
    label: 'estudiante',
  },
  Egresado: {
    name: 'text-cyan-800 dark:text-cyan-200',
    badge: 'bg-cyan-50 text-cyan-800 border border-cyan-200/60 dark:border-transparent dark:bg-cyan-400/15 dark:text-cyan-200',
    label: 'egresado',
  },
  Empleador: {
    name: 'text-fuchsia-700 dark:text-fuchsia-200',
    badge: 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-400/15 dark:text-fuchsia-200',
    label: 'empleador',
  },
};

export const getRoleStyle = (role) =>
  roleStyles[role] ?? {
    name: 'text-slate-800 dark:text-slate-100',
    badge: 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300',
    label: role || 'usuario',
  };

export const resolveAvatarUrl = (user) => {
  if (user?.avatarUrl) {
    if (/^https?:\/\//i.test(user.avatarUrl) || user.avatarUrl.startsWith('data:')) {
      return user.avatarUrl;
    }
    if (user.avatarUrl.startsWith('/')) {
      return `${apiBaseUrl}${user.avatarUrl}`;
    }
    return user.avatarUrl;
  }
  return null;
};

export const failedAvatarUrls = new Set();

export const getInitials = (firstName, lastName) => {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('').slice(0, 2) || '?';
};

export const getNameInitials = (name = 'U') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

export const UserAvatar = ({ user, size = 'md' }) => {
  const avatarUrl = resolveAvatarUrl(user);
  const [failed, setFailed] = useState(() => Boolean(avatarUrl && failedAvatarUrls.has(avatarUrl)));
  const initials = getInitials(user?.firstName, user?.lastName);
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';

  useEffect(() => {
    setFailed(Boolean(avatarUrl && failedAvatarUrls.has(avatarUrl)));
  }, [avatarUrl]);

  const handleAvatarError = () => {
    if (avatarUrl) failedAvatarUrls.add(avatarUrl);
    setFailed(true);
  };

  if (!avatarUrl || failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-200 font-bold text-slate-600 shadow-sm ${sizeClass}`}
        aria-label={`Avatar de ${user?.firstName ?? 'usuario'}`}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={avatarUrl}
      className={`shrink-0 rounded-full border-2 border-white object-cover shadow-sm ${sizeClass}`}
      alt={`Avatar de ${user?.firstName ?? 'usuario'}`}
      decoding="async"
      loading="lazy"
      onError={handleAvatarError}
    />
  );
};

export const getParticipationBadges = (user) => {
  const badges = [];
  if ((user?.totalPosts ?? 0) >= 10) badges.push({ icon: 'fa-pen-nib', label: 'Publicador' });
  if ((user?.totalComments ?? 0) >= 20) badges.push({ icon: 'fa-comments', label: 'Conversador' });
  if ((user?.totalLikesReceived ?? 0) >= 25) badges.push({ icon: 'fa-star', label: 'Valorado' });
  return badges;
};

export const ParticipationBadges = ({ user }) => {
  const badges = getParticipationBadges(user);
  if (badges.length === 0) return null;
  return (
    <span className="ml-2 inline-flex items-center gap-1 align-middle">
      {badges.map((badge) => (
        <span
          key={badge.label}
          title={badge.label}
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-50 text-[10px] text-yellow-600"
        >
          <i className={`fa-solid ${badge.icon}`} />
        </span>
      ))}
    </span>
  );
};

export default UserAvatar;
