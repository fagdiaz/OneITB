import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrandLogo } from '../../branding/BrandLogo';
import { usePointerSpotlight } from '../../../hooks/usePointerSpotlight';
import useAuth from '../../../hooks/useAuth';
import { GlobalSearch } from './GlobalSearch';
import { Nav } from './Nav';

const HIDE_THRESHOLD = 96;
const DIRECTION_DELTA = 6;

export const Header = () => {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();
  const [isElevated, setIsElevated] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const previousScrollRef = useRef(0);
  const scrollFrameRef = useRef(null);
  const { containerRef, spotlightHandlers } = usePointerSpotlight();
  const isLoggedIn = Boolean(isAuthenticated && token);

  useEffect(() => {
    setIsHidden(false);
  }, [location.pathname]);

  useEffect(() => {
    previousScrollRef.current = Math.max(window.scrollY, 0);

    const handleScroll = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = window.requestAnimationFrame(() => {
        const currentScroll = Math.max(window.scrollY, 0);
        const delta = currentScroll - previousScrollRef.current;
        const reducedMotion = typeof window.matchMedia === 'function'
          && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        setIsElevated(currentScroll > 12);
        if (!isLoggedIn || reducedMotion || currentScroll < HIDE_THRESHOLD) {
          setIsHidden(false);
        } else if (delta > DIRECTION_DELTA) {
          setIsHidden(true);
        } else if (delta < -DIRECTION_DELTA) {
          setIsHidden(false);
        }

        previousScrollRef.current = currentScroll;
        scrollFrameRef.current = null;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, [isLoggedIn]);

  const revealHeader = () => setIsHidden(false);

  return (
    <>
      {isLoggedIn && (
        <div
          data-testid="header-reveal-zone"
          aria-hidden="true"
          onPointerEnter={revealHeader}
          className={`fixed inset-x-0 top-0 z-[45] h-2 bg-transparent ${isHidden ? 'pointer-events-auto' : 'pointer-events-none'}`}
        />
      )}
      <header
        ref={containerRef}
        {...spotlightHandlers}
        onPointerEnter={revealHeader}
        onFocusCapture={revealHeader}
        className={[
          'isolate sticky top-0 z-40 flex h-14 w-full max-w-full shrink-0 items-center gap-2 overflow-visible border-b px-2 text-slate-100 transition-[transform,background-color,box-shadow,border-color] duration-300 ease-out sm:gap-3 sm:px-4 no-print print:hidden',
          isHidden ? '-translate-y-full' : 'translate-y-0',
          isElevated
            ? 'border-cyan-300/15 bg-slate-900/90 shadow-[0_14px_44px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/92 dark:shadow-[0_18px_52px_rgba(15,23,42,0.38)]'
            : 'border-slate-700/70 bg-slate-900 dark:border-white/10 dark:bg-slate-800',
        ].join(' ')}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-90 motion-reduce:hidden"
          style={{
            background: 'radial-gradient(440px circle at var(--spotlight-x) var(--spotlight-y), rgba(34,211,238,0.20), rgba(59,130,246,0.10) 44%, transparent 76%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 motion-reduce:hidden"
          style={{
            background: 'radial-gradient(180px circle at var(--spotlight-x) var(--spotlight-y), rgba(224,242,254,0.10), transparent 82%)',
          }}
        />

        <Link
          to="/"
          aria-label="Ir al inicio de OneITB"
          className="relative z-10 inline-flex h-11 shrink-0 items-center rounded-xl px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          <BrandLogo
            variant="symbol"
            decorative
            className="h-9 w-9 object-contain sm:h-10 sm:w-10"
            fetchpriority="high"
          />
        </Link>

        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {isLoggedIn && <GlobalSearch />}
          <Nav />
        </div>
      </header>
    </>
  );
};
