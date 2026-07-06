import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export const Logout = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    const closeSession = async () => {
      await logout()
      if (!cancelled) {
        navigate('/login', { replace: true })
      }
    }

    closeSession()

    return () => {
      cancelled = true
    }
  }, [logout, navigate])

  return (
    <h1>Cerrando sesión...</h1>
  )
}
