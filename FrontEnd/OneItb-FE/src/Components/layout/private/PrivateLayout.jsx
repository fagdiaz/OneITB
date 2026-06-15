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

      {/* Mini Chat Widget (Módulo 4) */}
      {auth.id && !location.pathname.toLowerCase().startsWith('/chat') && (
        <MiniChatWidget />
      )}

    </div>
  )
}
