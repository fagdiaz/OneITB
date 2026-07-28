import { describe, expect, it, vi } from 'vitest';
import { createInterfaceErrorId, reportInterfaceError } from './InterfaceFailureView';

describe('interface failure diagnostics', () => {
  it('generates a fallback correlation ID when Web Crypto is unavailable', () => {
    expect(createInterfaceErrorId(null)).toMatch(/^ui-[a-z0-9]+-[a-z0-9]+$/);
  });

  it('does not log the exception message or session data', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    reportInterfaceError(
      new Error('token=secret-value email=private@itbeltran.com.ar'),
      'ui-safe-id',
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Unhandled OneITB interface error',
      {
        errorId: 'ui-safe-id',
        errorName: 'Error',
      },
    );
  });
});
