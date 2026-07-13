import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RevealOnScroll } from './RevealOnScroll';

describe('RevealOnScroll', () => {
  let observerCallback;
  const observe = vi.fn();
  const disconnect = vi.fn();

  beforeEach(() => {
    observe.mockClear();
    disconnect.mockClear();
    observerCallback = undefined;
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    window.IntersectionObserver = vi.fn(function IntersectionObserver(callback) {
      observerCallback = callback;
      this.observe = observe;
      this.disconnect = disconnect;
      this.unobserve = vi.fn();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reveals once and disconnects its observer', () => {
    render(<RevealOnScroll>Contenido institucional</RevealOnScroll>);

    const section = screen.getByText('Contenido institucional');
    expect(section).toHaveClass('opacity-0');
    expect(observe).toHaveBeenCalledWith(section);

    act(() => observerCallback([{ isIntersecting: true }]));

    expect(section).toHaveClass('opacity-100');
    expect(disconnect).toHaveBeenCalled();
  });

  it('shows content immediately when reduced motion is requested', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });

    render(<RevealOnScroll>Sin animacion</RevealOnScroll>);

    expect(screen.getByText('Sin animacion')).toHaveClass('opacity-100');
    expect(window.IntersectionObserver).not.toHaveBeenCalled();
  });
});
