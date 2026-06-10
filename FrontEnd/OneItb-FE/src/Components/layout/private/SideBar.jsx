import React from 'react'
import useAuth from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'

/**
 * SideBar — REFACTOR 034
 * 
 * Replaces all legacy BEM class names (.layout__aside, .aside__container, etc.)
 * with equivalent Tailwind utility classes.
 * All data display is preserved: avatar, name, alias, stats, quick-post form.
 */
export const SideBar = () => {

  const { auth } = useAuth();

  return (
    <div className="flex flex-col h-full p-4 gap-4">

      {/* Profile Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        {/* Header */}
        <div className="border-b border-slate-100 pb-3 mb-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Mi Cuenta
          </h2>
        </div>

        {/* Avatar + Name */}
        <div className="flex items-center gap-3 mb-4">
          <Link to="/profile" className="shrink-0">
            <img
              src={`https://ui-avatars.com/api/?name=${auth.fullName || 'User'}&background=3785e5&color=fff&size=64`}
              className="w-12 h-12 rounded-full ring-2 ring-blue-200 object-cover"
              alt="Foto de perfil"
            />
          </Link>
          <div className="min-w-0">
            <Link
              to="/profile"
              className="block text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors truncate"
            >
              {auth.fullName || 'Usuario'}
            </Link>
            <p className="text-xs text-slate-500 truncate">
              @{auth.username || 'usuario'}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex divide-x divide-slate-100 border-t border-slate-100 pt-3">
          <a href="#" className="flex-1 flex flex-col items-center gap-0.5 hover:text-blue-600 transition-colors group">
            <span className="text-lg font-bold text-blue-600 group-hover:text-blue-700">10</span>
            <span className="text-xs text-slate-500">Siguiendo</span>
          </a>
          <a href="#" className="flex-1 flex flex-col items-center gap-0.5 hover:text-blue-600 transition-colors group">
            <span className="text-lg font-bold text-blue-600 group-hover:text-blue-700">13</span>
            <span className="text-xs text-slate-500">Seguidores</span>
          </a>
          <a href="#" className="flex-1 flex flex-col items-center gap-0.5 hover:text-blue-600 transition-colors group">
            <span className="text-lg font-bold text-blue-600 group-hover:text-blue-700">17</span>
            <span className="text-xs text-slate-500">Posts</span>
          </a>
        </div>
      </div>

      {/* Quick Post Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex-1">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          ¿Qué estás pensando?
        </h3>

        <form className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="sidebar-post" className="text-xs font-medium text-slate-500">
              Contenido
            </label>
            <textarea
              id="sidebar-post"
              name="post"
              rows={4}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              placeholder="Comparte algo con la comunidad..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="sidebar-image" className="text-xs font-medium text-slate-500">
              Imagen (opcional)
            </label>
            <input
              id="sidebar-image"
              type="file"
              name="image"
              accept="image/*"
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition"
            />
          </div>

          <button
            type="submit"
            disabled
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Publicar
          </button>
        </form>
      </div>

    </div>
  )
}
