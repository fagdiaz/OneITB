import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';

const ThemeControl = () => {
  const { theme, toggleTheme } = useTheme();
  return <button type="button" onClick={toggleTheme}>{theme}</button>;
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
});
