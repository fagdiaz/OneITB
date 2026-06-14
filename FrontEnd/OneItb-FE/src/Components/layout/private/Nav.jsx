import React, { useState, useRef, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'

/**
 * Nav — REFACTOR 037 / 040
 * 
 * Full Tailwind rewrite.
 * Conditionally renders auth dropdown if logged in, or Login/Register buttons if not.
 */
export const Nav = () => {
  const { auth } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine if authenticated (checking id or token)
  const isAuthenticated = !!auth.id;

  return (
    <nav className="flex items-center gap-6">

      {/* Main nav links */}
      <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
        <li>
          <NavLink
            to={isAuthenticated ? "/feed" : "/"}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive && isAuthenticated
                  ? 'bg-white/15 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <i className="fa-solid fa-house text-xs" />
            <span>Inicio</span>
          </NavLink>
        </li>
        {isAuthenticated && (
          <li>
            <NavLink
              to="/chat"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <i className="fa-regular fa-comment-dots text-xs" />
              <span>Mensajes</span>
            </NavLink>
          </li>
        )}
        {isAuthenticated && auth.role === 'Administrador' && (
          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <i className="fa-solid fa-users-gear text-xs" />
              <span>Admin</span>
            </NavLink>
          </li>
        )}
      </ul>

      {/* Right side: greeting + avatar dropdown OR login/register buttons */}
      <div className="flex items-center gap-4">

        {isAuthenticated ? (
          <>
            {/* Greeting */}
            <span className="hidden sm:block text-sm font-medium text-slate-300">
              Hola, <span className="text-white font-semibold">{auth.username || 'Usuario'}</span>
            </span>

            {/* Avatar + dropdown trigger */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 cursor-pointer focus:outline-none group"
                aria-label="Menú de usuario"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(auth.fullName || auth.username || 'U')}&background=3b82f6&color=fff&size=80`}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-white/50 transition-all"
                  alt="Foto de perfil"
                />
                <i
                  className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <ul className="absolute right-0 top-[calc(100%+8px)] w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden list-none m-0 p-0">
                  <li>
                    <NavLink
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <i className="fa-solid fa-user w-4 text-slate-400" />
                      Mi Perfil
                    </NavLink>
                  </li>
                  <li className="border-t border-slate-100 my-1" />
                  <li>
                    <NavLink
                      to="/logout"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium transition-colors"
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
          /* Unauthenticated actions */
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              Registrarse
            </Link>
          </div>
        )}

      </div>
    </nav>
  )
}
