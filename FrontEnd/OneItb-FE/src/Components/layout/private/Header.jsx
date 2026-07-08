import React, { useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Nav } from './Nav'
import { GlobalSearch } from './GlobalSearch'
import useAuth from '../../../hooks/useAuth'

/**
 * Header — Spotlight Effect
 *
 * Técnica de performance: las coordenadas del cursor se escriben
 * DIRECTAMENTE como CSS custom properties en el elemento del DOM
 * (headerRef.current.style.setProperty), sin pasar por useState.
 *
 * Resultado: CERO re-renders de React por movimiento de mouse.
 * El navegador actualiza solo la capa de composición de CSS.
 *
 * El spotlight es un div absoluto con pointer-events-none que usa
 * radial-gradient centrado en var(--mouse-x) / var(--mouse-y).
 * Los nav-items reciben clases de hover lift (translate + shadow)
 * para "levantarse" cuando la linterna pasa por detrás.
 */
export const Header = () => {
  const { isAuthenticated, token } = useAuth()
  const headerRef = useRef(null)
  const spotlightRef = useRef(null)
  const rafRef = useRef(null)
  const isLoggedIn = Boolean(isAuthenticated && token)

  // Inicializa las CSS vars para que el spotlight empiece invisible
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    el.style.setProperty('--mouse-x', '-9999px')
    el.style.setProperty('--mouse-y', '-9999px')
  }, [])

  const handleMouseMove = useCallback((e) => {
    // Cancela el frame anterior para no acumular callbacks
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    rafRef.current = requestAnimationFrame(() => {
      const el = headerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      // Escritura directa → sin setState → sin re-render
      el.style.setProperty('--mouse-x', `${x}px`)
      el.style.setProperty('--mouse-y', `${y}px`)
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const el = headerRef.current
    if (!el) return
    // Mueve el spotlight fuera del viewport para desvanecerlo
    el.style.setProperty('--mouse-x', '-9999px')
    el.style.setProperty('--mouse-y', '-9999px')
  }, [])

  return (
    <header
      ref={headerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative isolate sticky top-0 z-40 flex h-14 w-full max-w-full shrink-0 items-center gap-4 overflow-visible border-b border-white/10 bg-slate-900 px-4 text-white shadow-md backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950 dark:text-white dark:shadow-[0_14px_45px_rgba(2,6,23,0.45)] no-print print:hidden"
    >
      {/*
        pointer-events-none: no intercepta clicks ni hovers.
        radial-gradient centrado en las CSS vars actualizadas por JS.
        El degradado va de azul-índigo suave a transparente.
        transition-opacity permite el fade-in/out al entrar/salir.
        ────────────────────────────────────────────────────────────── */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          background: [
            'radial-gradient(',
            '  380px circle at var(--mouse-x) var(--mouse-y),',
            '  rgba(59, 130, 246, 0.18) 0%,',
            '  rgba(99, 102, 241, 0.10) 40%,',
            '  transparent 75%',
            ')',
          ].join(''),
        }}
      />

      {/* Capa de brillo difuso secundaria (más estrecha, más blanca) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: [
            'radial-gradient(',
            '  160px circle at var(--mouse-x) var(--mouse-y),',
            '  rgba(191, 219, 254, 0.07) 0%,',
            '  transparent 80%',
            ')',
          ].join(''),
        }}
      />

      {/* ── BRAND ─────────────────────────────────────────────────── */}
      <Link
        to="/"
        className={[
          'relative z-10 shrink-0 rounded-lg px-2 py-1',
          'text-lg font-extrabold tracking-tight text-white',
          'transition-colors duration-150',
        ].join(' ')}
      >
        ONEITB
      </Link>

      {/* ── SEARCH + SPACER + NAV ─────────────────────────────────── */}
      <div className="relative z-10 flex min-w-0 flex-1 items-center gap-3">
        {isLoggedIn && <GlobalSearch />}
        <div className="min-w-4 flex-1" />
        <Nav />
      </div>
    </header>
  )
}
