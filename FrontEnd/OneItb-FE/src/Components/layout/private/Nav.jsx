import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useSubscription } from '@apollo/client'
import { NavLink, Link, useLocation } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import { NotificationBell } from '../../notifications/NotificationBell'
import { useTheme } from '../../../context/ThemeContext'
import { GET_USER_PROFILE } from '../../../data/graphql/queries/getUserProfile'
import { GET_MESSAGING_CONTACTS } from '../../../data/graphql/chat'
import { JOB_OFFER_CREATED } from '../../../data/graphql/jobs'
import { apiBaseUrl } from '../../../utils/uploadFile'

/**
 * Nav — REFACTOR 037 / 040 / Spotlight-hover
 *
 * Los ítems de navegación tienen clases de "hover lift":
 *   hover:-translate-y-0.5  → se elevan 2px
 *   hover:shadow-[...]      → glow azul suave
 *   hover:border-white/20   → borde sutil visible
 *
 * Estos efectos se ven especialmente bien junto con el Spotlight
 * del Header porque el gradiente ilumina el botón desde atrás
 * justo cuando el usuario lo está apuntando.
 */

/** Clases base para todos los ítems de nav */
const NAV_BASE = [
  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
  'border border-transparent',
  'transition-all duration-150 ease-out',
  'will-change-transform',
  'hover:-translate-y-0.5',
  'hover:border-white/15 hover:bg-white/10 hover:text-white',
  'hover:shadow-[0_4px_14px_rgba(59,130,246,0.30),0_1px_4px_rgba(0,0,0,0.25)]',
].join(' ')

const NAV_ACTIVE = 'border-blue-300/30 bg-white/15 text-white ring-1 ring-blue-300/20 shadow-[0_4px_14px_rgba(59,130,246,0.34),0_1px_4px_rgba(0,0,0,0.25)]'
const NAV_INACTIVE = 'text-slate-300'

const resolveAssetUrl = (value) => {
  if (!value) return null
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value
  if (value.startsWith('/')) return `${apiBaseUrl}${value}`
  return value
}

export const Nav = () => {
  const { auth, isAuthenticated, token, sessionVersion } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const [jobOfferBadgeCount, setJobOfferBadgeCount] = useState(0)
  const dropdownRef = useRef(null)
  const lastJobOfferIdRef = useRef(null)
  const isDark = theme === 'dark'
  const safeAuth = auth ?? {}
  const isAuthenticatedUser = Boolean(isAuthenticated && token && safeAuth?.id)
  const { data: meData } = useQuery(GET_USER_PROFILE, {
    skip: !isAuthenticatedUser,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  })
  const { data: messagingData } = useQuery(GET_MESSAGING_CONTACTS, {
    variables: { first: 50 },
    skip: !isAuthenticatedUser,
    fetchPolicy: 'cache-and-network',
  })
  const { data: jobOfferSubscriptionData } = useSubscription(JOB_OFFER_CREATED, {
    skip: !isAuthenticatedUser,
  })

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasSessionProfile = Boolean(
    isAuthenticatedUser &&
    meData?.me?.id &&
    safeAuth?.id &&
    meData.me.id === safeAuth.id
  )
  const sessionProfile = hasSessionProfile ? meData.me : null
  const currentUser = sessionProfile || safeAuth
  const currentName = currentUser?.fullName || safeAuth?.fullName || safeAuth?.username || 'Usuario'
  const resolvedAvatarUrl = resolveAssetUrl(currentUser?.avatarUrl || safeAuth?.avatarUrl)
  const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentName)}&background=3b82f6&color=fff&size=80`
  const avatarSrc = !avatarFailed && resolvedAvatarUrl ? resolvedAvatarUrl : fallbackAvatarUrl
  const unreadMessageCount = (messagingData?.messagingContacts?.nodes || [])
    .reduce((total, contact) => total + (contact.unreadCount || 0), 0)

  useEffect(() => {
    setAvatarFailed(false)
    setDropdownOpen(false)
  }, [safeAuth?.id, resolvedAvatarUrl, sessionVersion])

  useEffect(() => {
    if (location.pathname.startsWith('/empleos')) {
      setJobOfferBadgeCount(0)
    }
  }, [location.pathname])

  useEffect(() => {
    const offer = jobOfferSubscriptionData?.jobOfferCreated
    if (!offer?.id || offer.id === lastJobOfferIdRef.current) return

    lastJobOfferIdRef.current = offer.id
    if (!location.pathname.startsWith('/empleos')) {
      setJobOfferBadgeCount((current) => Math.min(current + 1, 9))
    }
  }, [jobOfferSubscriptionData, location.pathname])

  const isActivePath = (targetPath) => {
    if (targetPath === '/') return location.pathname === '/'
    if (targetPath === '/empleos') return location.pathname === '/empleos'
    return location.pathname === targetPath || location.pathname.startsWith(`${targetPath}/`)
  }

  const navClassFor = (targetPath) =>
    `${NAV_BASE} ${isActivePath(targetPath) ? NAV_ACTIVE : NAV_INACTIVE}`

  return (
    <nav className="flex items-center gap-6">

      {/* ── Main nav links ─────────────────────────────────────── */}
      <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
        <li>
          <NavLink
            to={isAuthenticatedUser ? '/feed' : '/'}
            className={navClassFor(isAuthenticatedUser ? '/feed' : '/')}
          >
            <i className="fa-solid fa-house text-xs" />
            <span>Inicio</span>
          </NavLink>
        </li>

        {isAuthenticatedUser && (
          <li>
            <NavLink to="/chat" className={`${navClassFor('/chat')} relative`}>
              <i className="fa-regular fa-comment-dots text-xs" />
              <span>Mensajes</span>
              {unreadMessageCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-white/60 bg-red-500 px-1 text-[10px] font-black leading-none text-white shadow-sm">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </span>
              )}
            </NavLink>
          </li>
        )}

        {isAuthenticatedUser && (
          <li>
            <NavLink to="/academic" className={navClassFor('/academic')}>
              <i className="fa-solid fa-graduation-cap text-xs" />
              <span>Academico</span>
            </NavLink>
          </li>
        )}

        {isAuthenticatedUser && (
          <li>
            <NavLink to="/empleos" className={`${navClassFor('/empleos')} relative`}>
              <i className="fa-solid fa-briefcase text-xs" />
              <span>Empleos</span>
              {jobOfferBadgeCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-white/60 bg-red-500 px-1 text-[10px] font-black leading-none text-white shadow-sm">
                  {jobOfferBadgeCount > 9 ? '9+' : jobOfferBadgeCount}
                </span>
              )}
            </NavLink>
          </li>
        )}

        {isAuthenticatedUser && (safeAuth?.role === 'Empleador' || safeAuth?.role === 'Administrador') && (
          <li>
            <NavLink to="/empleos/mis-ofertas" className={navClassFor('/empleos/mis-ofertas')}>
              <i className="fa-solid fa-list-check text-xs" />
              <span>Postulaciones</span>
            </NavLink>
          </li>
        )}

        {isAuthenticatedUser && safeAuth?.role === 'Administrador' && (
          <li>
            <NavLink to="/admin" className={navClassFor('/admin')}>
              <i className="fa-solid fa-users-gear text-xs" />
              <span>Admin</span>
            </NavLink>
          </li>
        )}
      </ul>

      {/* ── Right side ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4">

        {isAuthenticatedUser ? (
          <>
            <span className="hidden sm:block text-sm font-medium text-slate-300">
              Hola, <span className="font-semibold text-white">{currentName}</span>
            </span>

            <NotificationBell />

            {/* Avatar + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(prev => !prev)}
                className={[
                  'flex items-center gap-2 cursor-pointer',
                  'rounded-full border border-transparent px-0.5 py-0.5',
                  'transition-all duration-150',
                  'hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_4px_14px_rgba(59,130,246,0.35)]',
                ].join(' ')}
                aria-label="Menú de usuario"
              >
                <img
                  src={avatarSrc}
                  onError={() => setAvatarFailed(true)}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20 transition-all duration-200 hover:ring-white/50"
                  alt="Foto de perfil"
                />
                <i
                  className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {dropdownOpen && (
                <ul className="absolute right-0 top-[calc(100%+12px)] z-[80] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 py-1.5 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-xl ring-1 ring-slate-900/5 list-none m-0 p-0 dark:border-white/10 dark:bg-slate-950/95 dark:text-slate-100 dark:shadow-[0_24px_70px_rgba(15,23,42,0.45)] dark:ring-blue-400/10">
                  <li>
                    <NavLink
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/[0.05] dark:hover:text-white"
                    >
                      <i className="fa-solid fa-user w-4 text-blue-300" />
                      Mi Perfil
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/profile/edit"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/[0.05] dark:hover:text-white"
                    >
                      <i className="fa-solid fa-pen-to-square w-4 text-blue-300" />
                      Editar Perfil
                    </NavLink>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/[0.05] dark:hover:text-white"
                    >
                      <span className="flex items-center gap-3">
                        <i className={`fa-solid ${isDark ? 'fa-moon' : 'fa-sun'} w-4 ${isDark ? 'text-blue-300' : 'text-amber-500'}`} />
                        <span>{isDark ? 'Tech Noir' : 'Clean Tech'}</span>
                      </span>
                      <span className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${isDark ? 'border-blue-300/30 bg-blue-500/20' : 'border-amber-200 bg-amber-50'}`}>
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition ${isDark ? 'translate-x-5 bg-blue-300 text-slate-950' : 'translate-x-0.5 bg-white text-amber-500'}`}>
                          <i className={`fa-solid ${isDark ? 'fa-moon' : 'fa-sun'} text-[10px]`} />
                        </span>
                      </span>
                    </button>
                  </li>
                  <li className="my-1 border-t border-slate-200 dark:border-white/10" />
                  <li>
                    <NavLink
                      to="/logout"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-500/10 dark:hover:text-red-100"
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket w-4" />
                      Salir
                    </NavLink>
                  </li>
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className={`${NAV_BASE} ${NAV_INACTIVE}`}
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(59,130,246,0.50)] border border-transparent hover:border-blue-400/50"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
