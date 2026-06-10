import React from 'react'
import { Link } from 'react-router-dom'

export const Landing = () => {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '4rem auto',
      padding: '3rem',
      background: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e2e8f0',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '3.6rem',
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Bienvenido a OneITB
      </h1>
      <p style={{
        fontSize: '1.8rem',
        color: '#475569',
        lineHeight: '1.6',
        marginBottom: '3rem'
      }}>
        La red social y plataforma de portafolio profesional exclusiva para estudiantes y docentes del Instituto Tecnológico Beltrán.
      </p>
      <div style={{
        display: 'flex',
        gap: '2rem',
        justifyContent: 'center'
      }}>
        <Link to="/login" className="btn btn-succes" style={{
          padding: '1.2rem 2.5rem',
          fontSize: '1.6rem',
          fontWeight: '600',
          textDecoration: 'none'
        }}>
          Iniciar Sesión
        </Link>
        <Link to="/register" style={{
          padding: '1.2rem 2.5rem',
          fontSize: '1.6rem',
          fontWeight: '600',
          color: '#3b82f6',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          background: 'transparent',
          textDecoration: 'none',
          transition: 'all 0.2s ease-in-out'
        }}>
          Registrarse
        </Link>
      </div>
    </div>
  )
}
