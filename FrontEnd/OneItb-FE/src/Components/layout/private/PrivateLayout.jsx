import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Header } from './Header'
import { SideBar } from './SideBar'
import useAuth from '../../../hooks/useAuth'

export const PrivateLayout = () => {

  const {auth} = useAuth();
  console.log(auth);
  return (
    <div className="layout">
        {/*LAYOUT */}
        <Header/>

        {/* Contenido principal */}
        <section className='layout__content'>
          { auth.id ?
            <Outlet/>
            :
            <Navigate to="/login"></Navigate>
            }
        </section>
        
        {/* Barra Lateral */}
        <SideBar></SideBar>
    </div>
  )
}
