import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Header } from '../private/Header'
import useAuth from '../../../hooks/useAuth'

export const PublicLayout = () => {

  const {auth} = useAuth();
  const location = useLocation();
  const isPublicCertificateRoute = location.pathname.toLowerCase().startsWith('/certificate/');

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden">
        {/* Header (conditionally renders auth buttons inside Nav) */}
        <Header />

        {/* Contenido principal */}
        <main className="min-w-0 flex-1">
          {!auth.id ?
            <Outlet />
            : isPublicCertificateRoute ? <Outlet /> : <Navigate to="/feed" replace />
          }
        </main>
        
    </div>
  )
}
