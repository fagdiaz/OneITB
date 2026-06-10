import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Header } from '../private/Header'
import useAuth from '../../../hooks/useAuth'

export const PublicLayout = () => {

  const {auth} = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
        {/* Header (conditionally renders auth buttons inside Nav) */}
        <Header />

        {/* Contenido principal */}
        <main className="flex-1">
          {!auth.id ?
            <Outlet />
            : <Navigate to="/feed" replace />
          }
        </main>
        
    </div>
  )
}
