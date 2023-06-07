import React from 'react'
import { Routes, Route, BrowserRouter, Navigate, Link } from 'react-router-dom'
import { PublicLayout } from '../Components/layout/public/PublicLayout'
import { Login } from '../Components/user/Login'
import { Register } from '../Components/user/Register'
import { PrivateLayout } from '../Components/layout/private/PrivateLayout'
import { Feed } from '../Components/publication/feed'
import { AuthProvider } from '../context/AuthProvider'
import { Logout } from '../Components/user/Logout'

export const Routing = () => {
  return (
    <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path='/' element={<PublicLayout />}>
          <Route index element={<Login />} />
          <Route path='login' element={<Login />} />
          <Route path='register' element={<Register />} />
        </Route>

        <Route path='/social' element={<PrivateLayout />}>
          <Route index element={<Feed />} />
          <Route path='feed' element={<Feed />} />
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
