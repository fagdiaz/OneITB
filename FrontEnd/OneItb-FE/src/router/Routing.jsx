import React from 'react'
import { Routes, Route, BrowserRouter, Navigate, Link } from 'react-router-dom'
import { PublicLayout } from '../Components/layout/public/PublicLayout'
import { Landing } from '../Components/user/Landing'
import { Login } from '../Components/user/Login'
import { Register } from '../Components/user/Register'
import { PrivateLayout } from '../Components/layout/private/PrivateLayout'
import { Feed } from '../Components/publication/Feed'
import { UserProfile } from '../Components/profile/UserProfile'
import { AuthProvider } from '../context/AuthProvider'
import { Logout } from '../Components/user/Logout'

export const Routing = () => {
  return (
    <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path='/' element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path='login' element={<Login />} />
          <Route path='register' element={<Register />} />
        </Route>

        <Route path='/' element={<PrivateLayout />}>
          <Route path='feed' element={<Feed />} />
          <Route path='profile' element={<UserProfile />} />
          <Route path='logout' element={<Logout></Logout>} />
        </Route>

        <Route path='*' element={
          <>
            <p>
              <h1>Error 404</h1>
              <Link to="/"> Volver al inicio</Link>
            </p>
          </>
        } />

      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
