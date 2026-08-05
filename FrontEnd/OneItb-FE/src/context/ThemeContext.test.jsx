import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme, useThemeOverride } from './ThemeContext';

const ThemeControl = () => {
  const { theme, toggleTheme } = useTheme();
  return <button type="button" onClick={toggleTheme}>{theme}</button>;
};

const ThemeReadout = () => {
  const { effectiveTheme, theme } = useTheme();
  return <output>{`${theme}/${effectiveTheme}`}</output>;
};

const LightThemeOverride = () => {
  useThemeOverride('light');
  return null;
};

const OverrideHarness = () => {
  const [enabled, setEnabled] = React.useState(true);
  return (
    <>
      {enabled && <LightThemeOverride />}
      <ThemeReadout />
      <button type="button" onClick={() => setEnabled(false)}>Salir de onboarding</button>
    </>
  );
};

describe('ThemeProvider transitions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.setItem('token', 'token');
    localStorage.setItem('user', '{}');
    localStorage.setItem('oneitb-theme', 'light');
    window.matchMedia = vi.fn(() => ({ matches: false }));
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('keeps the transition marker for 800 ms and then removes it', () => {
    render(<ThemeProvider><ThemeControl /></ThemeProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'light' }));
    expect(document.documentElement).toHaveClass('theme-transitioning');
    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(799));
    expect(document.documentElement).toHaveClass('theme-transitioning');
    act(() => vi.advanceTimersByTime(1));
    expect(document.documentElement).not.toHaveClass('theme-transitioning');
  });

  it('applies a temporary light override without replacing the stored preference', () => {
    localStorage.setItem('oneitb-theme', 'dark');
    render(<ThemeProvider><OverrideHarness /></ThemeProvider>);

    expect(screen.getByText('dark/light')).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass('dark');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(localStorage.getItem('oneitb-theme')).toBe('dark');

    fireEvent.click(screen.getByRole('button', { name: 'Salir de onboarding' }));

    expect(screen.getByText('dark/dark')).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(localStorage.getItem('oneitb-theme')).toBe('dark');
  });
});
