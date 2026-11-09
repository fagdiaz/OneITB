import React from 'react'
import { Routes, Route, BrowserRouter, Navigate, useParams } from 'react-router-dom'
import { PublicLayout } from '../Components/layout/public/PublicLayout'
import { Landing } from '../Components/user/Landing'
import { Login } from '../Components/user/Login'
import { Register } from '../Components/user/Register'
import { PrivateLayout } from '../Components/layout/private/PrivateLayout'
import { Feed } from '../Components/publication/Feed'
import { UserProfile } from '../Components/profile/UserProfile'
import { CvEditorProfile } from '../Components/profile/CvEditorProfile'
import { AdminDashboard } from '../Components/admin/AdminDashboard'
import { EmployerLogin } from '../Components/auth/EmployerLogin'
import { AuthProvider } from '../context/AuthProvider'
import { Logout } from '../Components/user/Logout'
import { PrivateChat } from '../Components/chat/PrivateChat'
import { NotFound } from '../Components/layout/NotFound'
import { AcademicDashboard } from '../Components/academic/AcademicDashboard'
import { PublicCertificate } from '../Components/certificates/PublicCertificate'
import { NotificationProvider } from '../Components/notifications/NotificationProvider'
import { JobBoard } from '../Components/jobs/JobBoard'
import { EmployerJobOffers } from '../Components/jobs/EmployerJobOffers'
import { EmployerRequestForm } from '../Components/jobs/EmployerRequestForm'
import { RequireAcademicOnboarding } from '../Components/onboarding/RequireAcademicOnboarding'
import { AcademicOnboarding } from '../Components/onboarding/AcademicOnboarding'
import { MicrosoftRedirectCallback } from '../Components/auth/MicrosoftRedirectCallback'
import { MicrosoftRedirectBoundary } from '../Components/auth/MicrosoftRedirectBoundary'

const ProfileRedirect = () => {
  const { id } = useParams()
  return <Navigate to={id ? `/profile/${encodeURIComponent(id)}` : '/profile'} replace />
}

export const Routing = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <NotificationProvider>
      <MicrosoftRedirectBoundary>
      <Routes>
        <Route path='auth/microsoft/callback' element={<MicrosoftRedirectCallback />} />

        <Route path='/' element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path='login' element={<Login />} />
          <Route path='register' element={<Register />} />
          <Route path='registro' element={<Navigate to="/register" replace />} />
          <Route path='employer-login' element={<EmployerLogin />} />
          <Route path='empleos/solicitud' element={<EmployerRequestForm />} />
          <Route path='certificate/:id' element={<PublicCertificate />} />
        </Route>

        <Route path='onboarding/academic' element={<AcademicOnboarding />} />
        <Route path='onboarding' element={<Navigate to="/onboarding/academic" replace />} />

        <Route element={<RequireAcademicOnboarding />}>
          <Route path='/' element={<PrivateLayout />}>
            <Route path='feed' element={<Feed />} />
            <Route path='post/:id' element={<Feed />} />
            <Route path='profile' element={<UserProfile />} />
            <Route path='profile/:id' element={<UserProfile />} />
            <Route path='perfil' element={<Navigate to="/profile" replace />} />
            <Route path='perfil/:id' element={<ProfileRedirect />} />
            <Route path='profile/edit' element={<CvEditorProfile />} />
            <Route path='perfil/editar' element={<Navigate to="/profile/edit" replace />} />
            <Route path='chat' element={<PrivateChat />} />
            <Route path='mensajes' element={<Navigate to="/chat" replace />} />
            <Route path='academic' element={<AcademicDashboard />} />
            <Route path='academico' element={<Navigate to="/academic" replace />} />
            <Route path='materias' element={<Navigate to="/academic" replace />} />
            <Route path='empleos' element={<JobBoard />} />
            <Route path='empleos/mis-ofertas' element={<EmployerJobOffers />} />
            <Route path='empresa/ofertas' element={<Navigate to="/empleos/mis-ofertas" replace />} />
            <Route path='admin' element={<AdminDashboard />} />
            <Route path='admin/users' element={<Navigate to="/admin" replace />} />
            <Route path='logout' element={<Logout></Logout>} />
          </Route>
        </Route>

        <Route path='*' element={<NotFound />} />

      </Routes>
      </MicrosoftRedirectBoundary>
      </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
