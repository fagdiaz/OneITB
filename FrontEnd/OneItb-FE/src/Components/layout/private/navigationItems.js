const ROLE_EMPLOYER = 'Empleador';
const ROLE_ADMIN = 'Administrador';

export const buildNavigationItems = ({
  role,
  unreadMessageCount = 0,
  jobOfferBadgeCount = 0,
} = {}) => [
  {
    id: 'messages',
    to: '/chat',
    label: 'Mensajes',
    icon: 'fa-regular fa-comment-dots',
    badge: unreadMessageCount,
    badgeLabel: `${unreadMessageCount} mensajes sin leer`,
  },
  {
    id: 'academic',
    to: '/academic',
    label: 'Académico',
    icon: 'fa-solid fa-graduation-cap',
  },
  {
    id: 'jobs',
    to: '/empleos',
    label: 'Empleos',
    icon: 'fa-solid fa-briefcase',
    exact: true,
    badge: jobOfferBadgeCount,
    badgeLabel: `${jobOfferBadgeCount} ofertas nuevas`,
  },
  role === ROLE_EMPLOYER || role === ROLE_ADMIN
    ? {
        id: 'applications',
        to: '/empleos/mis-ofertas',
        label: 'Postulaciones',
        icon: 'fa-solid fa-list-check',
      }
    : null,
  role === ROLE_ADMIN
    ? {
        id: 'admin',
        to: '/admin',
        label: 'Admin',
        icon: 'fa-solid fa-users-gear',
      }
    : null,
].filter(Boolean);

export const isNavigationItemActive = (item, pathname) => {
  if (!item?.to || !pathname) return false;
  if (item.exact) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
};

export const formatNavigationBadge = (value) => {
  const safeValue = Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  if (safeValue === 0) return null;
  return safeValue > 9 ? '9+' : String(safeValue);
};
