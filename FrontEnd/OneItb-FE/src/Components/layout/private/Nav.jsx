import React, { useState, useRef, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import { NotificationBell } from '../../notifications/NotificationBell'

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
  'hover:text-white',
  'hover:border-white/15',
  'hover:shadow-[0_4px_14px_rgba(59,130,246,0.30),0_1px_4px_rgba(0,0,0,0.25)]',
].join(' ')

const NAV_ACTIVE   = 'bg-white/15 text-white border-white/10'
const NAV_INACTIVE = 'text-slate-300'

const navClass = ({ isActive }) =>
  `${NAV_BASE} ${isActive ? NAV_ACTIVE : NAV_INACTIVE}`

export const Nav = () => {
  const { auth } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isAuthenticated = !!auth.id

  return (
    <nav className="flex items-center gap-6">

      {/* ── Main nav links ─────────────────────────────────────── */}
      <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
        <li>
          <NavLink
            to={isAuthenticated ? '/feed' : '/'}
            className={navClass}
          >
            <i className="fa-solid fa-house text-xs" />
            <span>Inicio</span>
          </NavLink>
        </li>

        {isAuthenticated && (
          <li>
            <NavLink to="/chat" className={navClass}>
              <i className="fa-regular fa-comment-dots text-xs" />
              <span>Mensajes</span>
            </NavLink>
          </li>
        )}

        {isAuthenticated && (
          <li>
            <NavLink to="/academic" className={navClass}>
              <i className="fa-solid fa-graduation-cap text-xs" />
              <span>Academico</span>
            </NavLink>
          </li>
        )}

        {isAuthenticated && auth.role === 'Administrador' && (
          <li>
            <NavLink to="/admin" className={navClass}>
              <i className="fa-solid fa-users-gear text-xs" />
              <span>Admin</span>
            </NavLink>
          </li>
        )}
      </ul>

      {/* ── Right side ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4">

        {isAuthenticated ? (
          <>
            <span className="hidden sm:block text-sm font-medium text-slate-300">
              Hola, <span className="text-white font-semibold">{auth.username || 'Usuario'}</span>
            </span>

            <NotificationBell />

            {/* Avatar + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(prev => !prev)}
                className={[
                  'flex items-center gap-2 cursor-pointer focus:outline-none',
                  'rounded-full border border-transparent px-0.5 py-0.5',
                  'transition-all duration-150',
                  'hover:-translate-y-0.5 hover:border-white/20',
                  'hover:shadow-[0_4px_14px_rgba(59,130,246,0.35)]',
                ].join(' ')}
                aria-label="Menú de usuario"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(auth.fullName || auth.username || 'U')}&background=3b82f6&color=fff&size=80`}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20 hover:ring-white/50 transition-all duration-200"
                  alt="Foto de perfil"
                />
                <i
                  className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {dropdownOpen && (
                <ul className="absolute right-0 top-[calc(100%+12px)] z-[80] w-56 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 py-1.5 text-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.45)] backdrop-blur-xl ring-1 ring-blue-400/10 list-none m-0 p-0">
                  <li>
                    <NavLink
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <i className="fa-solid fa-user w-4 text-blue-300" />
                      Mi Perfil
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/profile/edit"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <i className="fa-solid fa-pen-to-square w-4 text-blue-300" />
                      Editar Perfil
                    </NavLink>
                  </li>
                  <li className="my-1 border-t border-white/10" />
                  <li>
                    <NavLink
                      to="/logout"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-100"
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
