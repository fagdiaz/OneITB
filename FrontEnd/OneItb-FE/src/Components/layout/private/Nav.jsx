import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { Link, NavLink, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { NotificationBell } from '../../notifications/NotificationBell';
import { useTheme } from '../../../context/ThemeContext';
import { GET_USER_PROFILE } from '../../../data/graphql/queries/getUserProfile';
import { GET_MESSAGING_CONTACTS } from '../../../data/graphql/chat';
import { JOB_OFFER_CREATED } from '../../../data/graphql/jobs';
import { apiBaseUrl } from '../../../utils/uploadFile';
import { EMPLOYER_REQUEST_NAVIGATION } from '../../jobs/employerNavigation';
import {
  buildNavigationItems,
  formatNavigationBadge,
  isNavigationItemActive,
} from './navigationItems';
import { useProgressiveNavigation } from './useProgressiveNavigation';

const NAV_BASE = [
  'relative flex items-center gap-2 whitespace-nowrap rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium',
  'transition-all duration-150 ease-out will-change-transform',
  'hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/10 hover:text-white',
  'hover:shadow-[0_4px_14px_rgba(59,130,246,0.30),0_1px_4px_rgba(0,0,0,0.25)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300',
].join(' ');

const NAV_ACTIVE = 'border-blue-300/30 bg-white/15 text-white ring-1 ring-blue-300/20 shadow-[0_4px_14px_rgba(59,130,246,0.34),0_1px_4px_rgba(0,0,0,0.25)]';
const NAV_INACTIVE = 'text-slate-300';
const MENU_LINK_BASE = 'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300';
const MENU_LINK_ACTIVE = 'bg-blue-500/15 text-white ring-1 ring-blue-300/25';
const MENU_LINK_INACTIVE = 'text-slate-300 hover:bg-white/10 hover:text-white';

const resolveAssetUrl = (value) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  if (value.startsWith('/')) return `${apiBaseUrl}${value}`;
  return value;
};

const getInitials = (name = 'Usuario') => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'U';

const NavigationBadge = ({ item, compact = false }) => {
  const value = formatNavigationBadge(item.badge);
  if (!value) return null;

  return (
    <span
      aria-label={item.badgeLabel}
      className={compact
        ? 'ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white'
        : 'absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-white/60 bg-red-500 px-1 text-[10px] font-black leading-none text-white shadow-sm'}
    >
      {value}
    </span>
  );
};

const NavigationItem = ({ item, pathname, compact = false, onNavigate }) => {
  const active = isNavigationItemActive(item, pathname);
  return (
    <NavLink
      to={item.to}
      end={item.exact}
      role={compact ? 'menuitem' : undefined}
      onClick={onNavigate}
      className={compact
        ? `${MENU_LINK_BASE} ${active ? MENU_LINK_ACTIVE : MENU_LINK_INACTIVE}`
        : `${NAV_BASE} ${active ? NAV_ACTIVE : NAV_INACTIVE}`}
    >
      <i
        aria-hidden="true"
        className={`${item.icon} ${compact ? 'w-4 text-xs text-blue-200' : 'text-xs'}`}
      />
      <span>{item.label}</span>
      <NavigationBadge item={item} compact={compact} />
    </NavLink>
  );
};

export const Nav = () => {
  const { auth, isAuthenticated, token, sessionVersion } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [jobOfferBadgeCount, setJobOfferBadgeCount] = useState(0);
  const dropdownRef = useRef(null);
  const overflowRef = useRef(null);
  const overflowButtonRef = useRef(null);
  const lastJobOfferIdRef = useRef(null);
  const isDark = theme === 'dark';
  const safeAuth = auth ?? {};
  const isAuthenticatedUser = Boolean(isAuthenticated && token && safeAuth?.id);

  const { data: meData } = useQuery(GET_USER_PROFILE, {
    skip: !isAuthenticatedUser,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });
  const { data: messagingData } = useQuery(GET_MESSAGING_CONTACTS, {
    variables: { first: 50 },
    skip: !isAuthenticatedUser,
    fetchPolicy: 'cache-and-network',
  });
  const { data: jobOfferSubscriptionData } = useSubscription(JOB_OFFER_CREATED, {
    skip: !isAuthenticatedUser,
  });

  const hasSessionProfile = Boolean(
    isAuthenticatedUser
    && meData?.me?.id
    && safeAuth?.id
    && meData.me.id === safeAuth.id,
  );
  const sessionProfile = hasSessionProfile ? meData.me : null;
  const currentUser = sessionProfile || safeAuth;
  const currentName = currentUser?.fullName || safeAuth?.fullName || safeAuth?.username || 'Usuario';
  const resolvedAvatarUrl = resolveAssetUrl(currentUser?.avatarUrl || safeAuth?.avatarUrl);
  const unreadMessageCount = (messagingData?.messagingContacts?.nodes || [])
    .reduce((total, contact) => total + (contact.unreadCount || 0), 0);
  const navigationItems = useMemo(
    () => buildNavigationItems({
      role: safeAuth?.role,
      unreadMessageCount,
      jobOfferBadgeCount,
    }),
    [jobOfferBadgeCount, safeAuth?.role, unreadMessageCount],
  );
  const {
    containerRef,
    measurementRef,
    overflowMeasurementRef,
    visibleCount,
  } = useProgressiveNavigation(navigationItems.map((item) => item.id));
  const visibleItems = navigationItems.slice(0, visibleCount);
  const overflowItems = navigationItems.slice(visibleCount);
  const overflowBadgeCount = overflowItems.reduce(
    (total, item) => total + Math.max(0, Number(item.badge) || 0),
    0,
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (overflowRef.current && !overflowRef.current.contains(event.target)) {
        setOverflowOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!overflowOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOverflowOpen(false);
      overflowButtonRef.current?.focus();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [overflowOpen]);

  useEffect(() => {
    setAvatarFailed(false);
    setDropdownOpen(false);
    setOverflowOpen(false);
  }, [safeAuth?.id, resolvedAvatarUrl, sessionVersion]);

  useEffect(() => {
    if (location.pathname.startsWith('/empleos')) setJobOfferBadgeCount(0);
    setOverflowOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (overflowItems.length === 0) setOverflowOpen(false);
  }, [overflowItems.length]);

  useEffect(() => {
    const offer = jobOfferSubscriptionData?.jobOfferCreated;
    if (!offer?.id || offer.id === lastJobOfferIdRef.current) return;
    lastJobOfferIdRef.current = offer.id;
    if (!location.pathname.startsWith('/empleos')) {
      setJobOfferBadgeCount((current) => Math.min(current + 1, 9));
    }
  }, [jobOfferSubscriptionData, location.pathname]);

  return (
    <nav aria-label="Navegación principal" className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
      {isAuthenticatedUser ? (
        <div ref={containerRef} data-testid="progressive-navigation-region" className="relative min-w-0 flex-1">
          <div className="flex min-w-0 items-center justify-end gap-1 overflow-visible">
            <ul className="m-0 flex min-w-0 list-none items-center gap-1 p-0">
              {visibleItems.map((item) => (
                <li key={item.id}>
                  <NavigationItem item={item} pathname={location.pathname} />
                </li>
              ))}
            </ul>

            {overflowItems.length > 0 && (
              <div ref={overflowRef} className="relative shrink-0">
                <button
                  ref={overflowButtonRef}
                  type="button"
                  onClick={() => setOverflowOpen((current) => !current)}
                  className={[
                    'relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10',
                    'bg-white/5 text-slate-200 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300',
                    overflowOpen ? 'ring-1 ring-blue-300/30 shadow-[0_4px_14px_rgba(59,130,246,0.34)]' : '',
                  ].join(' ')}
                  aria-label={overflowOpen ? 'Cerrar más opciones de navegación' : 'Abrir más opciones de navegación'}
                  aria-expanded={overflowOpen}
                  aria-haspopup="menu"
                  aria-controls="navigation-overflow-menu"
                >
                  <i aria-hidden="true" className={`fa-solid ${overflowOpen ? 'fa-xmark' : 'fa-ellipsis'} text-sm`} />
                  {overflowBadgeCount > 0 && !overflowOpen && (
                    <span
                      aria-label={`${overflowBadgeCount} novedades en opciones de navegación`}
                      className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-slate-950 bg-red-500 px-1 text-[9px] font-black leading-none text-white shadow-sm"
                    >
                      {formatNavigationBadge(overflowBadgeCount)}
                    </span>
                  )}
                </button>

                {overflowOpen && (
                  <div
                    id="navigation-overflow-menu"
                    role="menu"
                    className="absolute right-0 top-[calc(100%+12px)] z-[80] w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-slate-800/96 p-2 text-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.38)] backdrop-blur-xl ring-1 ring-blue-400/10"
                  >
                    <div className="grid gap-1">
                      {overflowItems.map((item) => (
                        <NavigationItem
                          key={item.id}
                          item={item}
                          pathname={location.pathname}
                          compact
                          onNavigate={() => setOverflowOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            ref={measurementRef}
            aria-hidden="true"
            className="pointer-events-none fixed -left-[10000px] top-0 flex items-center gap-1 invisible"
          >
            {navigationItems.map((item) => (
              <span key={item.id} data-navigation-measure-item className={`${NAV_BASE} ${NAV_INACTIVE}`}>
                <i className={`${item.icon} text-xs`} />
                <span>{item.label}</span>
              </span>
            ))}
            <span ref={overflowMeasurementRef} className="h-9 w-9 shrink-0" />
          </div>
        </div>
      ) : (
        <>
          <div className="min-w-0 flex-1" />
          <div ref={overflowRef} className="relative md:hidden">
            <button
              ref={overflowButtonRef}
              type="button"
              onClick={() => setOverflowOpen((current) => !current)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              aria-label={overflowOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              aria-expanded={overflowOpen}
            >
              <i aria-hidden="true" className={`fa-solid ${overflowOpen ? 'fa-xmark' : 'fa-bars'} text-sm`} />
            </button>
            {overflowOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] z-[80] w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl border border-white/10 bg-slate-800/96 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.38)] backdrop-blur-xl">
                <div className="grid gap-1">
                  <NavLink to={EMPLOYER_REQUEST_NAVIGATION.path} onClick={() => setOverflowOpen(false)} className={MENU_LINK_INACTIVE + ' ' + MENU_LINK_BASE}>
                    <i aria-hidden="true" className="fa-solid fa-building w-4 text-xs text-cyan-200" />
                    <span>{EMPLOYER_REQUEST_NAVIGATION.shortLabel}</span>
                  </NavLink>
                  <NavLink to="/login" onClick={() => setOverflowOpen(false)} className={MENU_LINK_INACTIVE + ' ' + MENU_LINK_BASE}>
                    <i aria-hidden="true" className="fa-solid fa-right-to-bracket w-4 text-xs text-blue-200" />
                    <span>Iniciar Sesión</span>
                  </NavLink>
                  <NavLink to="/register" onClick={() => setOverflowOpen(false)} className={MENU_LINK_INACTIVE + ' ' + MENU_LINK_BASE}>
                    <i aria-hidden="true" className="fa-solid fa-user-plus w-4 text-xs text-blue-200" />
                    <span>Registrarse</span>
                  </NavLink>
                </div>
              </div>
            )}
          </div>
          <div data-testid="desktop-auth-actions" className="hidden shrink-0 items-center gap-2 md:flex">
            <Link to={EMPLOYER_REQUEST_NAVIGATION.path} className="rounded-lg border border-cyan-300/35 bg-cyan-300/5 px-3 py-1.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
              {EMPLOYER_REQUEST_NAVIGATION.shortLabel}
            </Link>
            <Link to="/login" className={`${NAV_BASE} ${NAV_INACTIVE}`}>Iniciar Sesión</Link>
            <Link to="/register" className="rounded-lg border border-transparent bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Registrarse</Link>
          </div>
        </>
      )}

      {isAuthenticatedUser && (
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden max-w-36 truncate text-sm font-medium text-slate-300 2xl:block">
            Hola, <span className="font-semibold text-white">{currentName}</span>
          </span>

          <NotificationBell />

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((current) => !current)}
              className="flex cursor-pointer items-center gap-1 rounded-full border border-transparent p-0.5 transition hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_4px_14px_rgba(59,130,246,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              aria-label="Menú de usuario"
              aria-expanded={dropdownOpen}
            >
              {!avatarFailed && resolvedAvatarUrl ? (
                <img
                  src={resolvedAvatarUrl}
                  onError={() => setAvatarFailed(true)}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-white/20"
                  alt="Foto de perfil"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-xs font-black text-slate-100 ring-2 ring-white/20" aria-hidden="true">
                  {getInitials(currentName)}
                </span>
              )}
              <i aria-hidden="true" className={`fa-solid fa-chevron-down text-xs text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <ul className="absolute right-0 top-[calc(100%+12px)] z-[80] m-0 w-64 list-none overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-0 py-1.5 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-xl ring-1 ring-slate-900/5 dark:border-white/10 dark:bg-slate-800/96 dark:text-slate-100 dark:shadow-[0_24px_70px_rgba(15,23,42,0.36)] dark:ring-blue-400/10">
                <li><NavLink to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.05]"><i aria-hidden="true" className="fa-solid fa-user w-4 text-blue-300" />Mi Perfil</NavLink></li>
                <li><NavLink to="/profile/edit" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.05]"><i aria-hidden="true" className="fa-solid fa-pen-to-square w-4 text-blue-300" />Editar Perfil</NavLink></li>
                <li>
                  <button type="button" onClick={toggleTheme} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.05]">
                    <span className="flex items-center gap-3"><i aria-hidden="true" className={`fa-solid ${isDark ? 'fa-moon' : 'fa-sun'} w-4 ${isDark ? 'text-blue-300' : 'text-amber-500'}`} /><span>{isDark ? 'Tech Noir' : 'Clean Tech'}</span></span>
                    <span aria-hidden="true" className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${isDark ? 'border-blue-300/30 bg-blue-500/20' : 'border-amber-200 bg-amber-50'}`}><span className={`inline-flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition ${isDark ? 'translate-x-5 bg-blue-300 text-slate-950' : 'translate-x-0.5 bg-white text-amber-500'}`}><i className={`fa-solid ${isDark ? 'fa-moon' : 'fa-sun'} text-[10px]`} /></span></span>
                  </button>
                </li>
                <li className="my-1 border-t border-slate-200 dark:border-white/10" />
                <li><NavLink to="/logout" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"><i aria-hidden="true" className="fa-solid fa-arrow-right-from-bracket w-4" />Salir</NavLink></li>
              </ul>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
