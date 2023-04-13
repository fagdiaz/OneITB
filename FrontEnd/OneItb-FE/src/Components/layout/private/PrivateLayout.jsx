import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { SideBar } from './SideBar'

export const PrivateLayout = () => {
  return (
    <>
        {/*LAYOUT */}
        <Header/>

        {/* Contenido principal */}
        <section className='layout__content'>
            <Outlet/>
        </section>
        
        {/* Barra Lateral */}
        <SideBar></SideBar>
    </>
  )
}
