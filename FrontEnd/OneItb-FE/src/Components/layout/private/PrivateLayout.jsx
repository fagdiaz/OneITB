import React from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { SideBar } from './SideBar'
import useAuth from '../../../hooks/useAuth'

/**
 * PrivateLayout — REFACTOR 034
 * 
 * Structure:
 *   ┌─────────────────────────────────────────────┐
 *   │  <Header> (sticky top navbar)                │
 *   ├─────────────────────────────┬───────────────┤
 *   │  <main> (flex-1 content)    │  <SideBar>    │
 *   │                             │  (right rail) │
 *   └─────────────────────────────┴───────────────┘
 *
 * NOTE: Uses Tailwind utility classes exclusively.
 * Legacy .layout / .layout__content / .layout__aside classes are REMOVED.
 */
export const PrivateLayout = () => {

  const { auth } = useAuth();
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* Top Navigation Bar */}
      <Header />

      {/* Body: content + sidebar */}
      <div className="flex flex-1 overflow-hidden">

        {/* Main content area — overflow-hidden so child pages control their own scroll */}
        <main className="flex-1 overflow-hidden">
          {auth.id
            ? <Outlet />
            : <Navigate to="/login" />
          }
        </main>

        {/* Right-rail sidebar — hidden on mobile, visible on lg+ */}
        <aside className="hidden lg:block w-72 shrink-0 border-l border-slate-200 bg-white overflow-y-auto">
          <SideBar />
        </aside>

      </div>

      {/* Floating Message Button (conditional on session) */}
      {auth.id && location.pathname !== '/chat' && (
        <Link
          to="/chat"
          className="fixed bottom-5 right-5 lg:right-80 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg cursor-pointer z-50 transition-all duration-300 hover:scale-110 hover:shadow-xl no-print"
          style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
          title="Mensajería Privada"
          aria-label="Abrir mensajería privada"
        >
          <i className="fa-regular fa-comment-dots text-2xl" />
        </Link>
      )}

    </div>
  )
}
