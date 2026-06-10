import React, { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'

/**
 * Nav — REFACTOR 037
 * 
 * Full Tailwind rewrite. Eliminates all BEM classes:
 *   navbar__container-lists, container-lists__menu-list, menu-list__item,
 *   menu-list__link, menu-list__title, list-end__name, list-end__img
 * Eliminates all inline styles.
 * Adds click-outside to close dropdown.
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

  return (
    <nav className="flex items-center gap-6">

      {/* Main nav links */}
      <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
        <li>
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <i className="fa-solid fa-house text-xs" />
            <span>Inicio</span>
          </NavLink>
        </li>
      </ul>

      {/* Right side: greeting + avatar dropdown */}
      <div className="flex items-center gap-4">

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

              {/* Mi Perfil */}
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

              {/* Divider */}
              <li className="border-t border-slate-100 my-1" />

              {/* Cerrar sesión */}
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

      </div>
    </nav>
  )
}
