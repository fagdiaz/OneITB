import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ATS_PAGE_STYLE, useCvAtsPrint } from './useCvAtsPrint';

const mocks = vi.hoisted(() => ({
  print: vi.fn(),
  options: undefined as any,
}));

vi.mock('react-to-print', () => ({
  useReactToPrint: (options: any) => {
    mocks.options = options;
    return mocks.print;
  },
}));

describe('useCvAtsPrint', () => {
  beforeEach(() => {
    mocks.print.mockReset();
    mocks.options = undefined;
  });

  it('prints only when the canonical document exists', () => {
    const contentRef = { current: document.createElement('article') };
    const { result } = renderHook(() => useCvAtsPrint({ contentRef, documentTitle: 'CV de Álex' }));

    act(() => result.current.printCv());

    expect(mocks.print).toHaveBeenCalledTimes(1);
    expect(mocks.options.contentRef).toBe(contentRef);
    expect(mocks.options.documentTitle).toBe('CV-de-Álex');
    expect(mocks.options.pageStyle).toBe(ATS_PAGE_STYLE);
  });

  it('returns a recoverable Spanish error when the preview is unavailable', () => {
    const contentRef = { current: null };
    const { result } = renderHook(() => useCvAtsPrint({ contentRef }));

    act(() => result.current.printCv());

    expect(mocks.print).not.toHaveBeenCalled();
    expect(result.current.printError).toMatch(/todavía no está disponible/i);
  });

  it('maps print library failures without exposing document content', () => {
    const contentRef = { current: document.createElement('article') };
    const { result } = renderHook(() => useCvAtsPrint({ contentRef }));

    act(() => mocks.options.onPrintError('print', new Error('driver failure')));

    expect(result.current.printError).toBe('No se pudo preparar el CV para imprimir. Intenta nuevamente.');
  });
});
