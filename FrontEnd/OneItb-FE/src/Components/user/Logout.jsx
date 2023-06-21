import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export const Logout = () => {

  const {setAuth} = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
    setAuth({});
    navigate("/login");

  })

  return (
    <h1>Cerrando sesión...</h1>
  )
}
