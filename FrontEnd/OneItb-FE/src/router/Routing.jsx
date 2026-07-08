import React from 'react'
import { Routes, Route, BrowserRouter, Navigate, Link } from 'react-router-dom'
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

export const Routing = () => {
  return (
    <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
      <Routes>
        <Route path='/' element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path='login' element={<Login />} />
          <Route path='register' element={<Register />} />
          <Route path='employer-login' element={<EmployerLogin />} />
          <Route path='certificate/:id' element={<PublicCertificate />} />
        </Route>

        <Route path='/' element={<PrivateLayout />}>
          <Route path='feed' element={<Feed />} />
          <Route path='profile' element={<UserProfile />} />
          <Route path='profile/:id' element={<UserProfile />} />
          <Route path='profile/edit' element={<CvEditorProfile />} />
          <Route path='chat' element={<PrivateChat />} />
          <Route path='academic' element={<AcademicDashboard />} />
          <Route path='empleos' element={<JobBoard />} />
          <Route path='empleos/mis-ofertas' element={<EmployerJobOffers />} />
          <Route path='admin' element={<AdminDashboard />} />
          <Route path='admin/users' element={<Navigate to="/admin" replace />} />
          <Route path='logout' element={<Logout></Logout>} />
        </Route>

        <Route path='*' element={<NotFound />} />

      </Routes>
      </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
