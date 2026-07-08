import React from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { SideBar } from './SideBar'
import { MiniChatWidget } from '../../chat/MiniChatWidget'
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
 *
 * FIX Spec-141: isLoading guard added — prevents premature redirect to /login
 * when the user presses F5 on a protected route, before AuthContext finishes
 * reading the token from localStorage.
 */
export const PrivateLayout = () => {

  const { auth, isLoading } = useAuth();
  const location = useLocation();

  // During localStorage hydration, render a full-screen neutral spinner
  // instead of evaluating auth.id (which is still {} at this point).
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="text-sm font-medium">Cargando sesión...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">

      {/* Top Navigation Bar */}
      <Header />

      {/* Body: content + sidebar */}
      <div className="flex min-w-0 flex-1 overflow-hidden">

        {/* Main content area — overflow-hidden so child pages control their own scroll */}
        <main className="min-w-0 flex-1 overflow-hidden">
          {auth.id
            ? <Outlet />
            : <Navigate to="/login" />
          }
        </main>

        {/* Right-rail sidebar — hidden on mobile, visible on lg+ */}
        <aside className="hidden lg:block w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white transition-colors dark:border-white/10 dark:bg-slate-950">
          <SideBar />
        </aside>

      </div>

      {/* Mini Chat Widget (Módulo 4) */}
      {auth.id && !location.pathname.toLowerCase().startsWith('/chat') && (
        <div className="print:hidden">
          <MiniChatWidget />
        </div>
      )}

    </div>
  )
}
