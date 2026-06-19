import React from 'react'
import { Link } from 'react-router-dom'
import { Nav } from './Nav'
import { GlobalSearch } from './GlobalSearch'

/**
 * Header — REFACTOR 034
 * 
 * Replaces legacy `.layout__navbar` class with Tailwind utility classes.
 * Uses `sticky top-0 z-40` so the navbar stays visible during scrolling.
 */
export const Header = () => {
  return (
    <header className="w-full bg-slate-900 sticky top-0 z-40 flex items-center justify-between h-14 px-4 shadow-md shrink-0 no-print">

      {/* Brand */}
      <Link
        to="/feed"
        className="text-white font-extrabold text-lg tracking-tight hover:text-blue-400 transition-colors"
      >
        ONEITB
      </Link>

      {/* Navigation and Search */}
      <div className="flex items-center gap-4 z-50">
        <GlobalSearch />
        <Nav />
      </div>
    </header>
  )
}
