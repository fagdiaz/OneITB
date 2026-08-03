import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  beginMicrosoftRedirectFlow,
  completeMicrosoftRedirectFlowOnce,
  markMicrosoftRedirectFlowCompleted,
  readMicrosoftRedirectFlow,
  resetMicrosoftRedirectCoordinatorForTests,
  sanitizeMicrosoftReturnTo,
} from './microsoftRedirectFlow';

describe('microsoftRedirectFlow', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetMicrosoftRedirectCoordinatorForTests();
  });

  it.each([
    ['https://attacker.example/path', '/feed'],
    ['//attacker.example/path', '/feed'],
    ['/\\attacker.example/path', '/feed'],
    ['/login', '/feed'],
    ['/auth/microsoft/callback', '/feed'],
    ['/logout', '/feed'],
    ['/academic?subject=3#resources', '/academic?subject=3#resources'],
  ])('sanitizes %s to %s', (input, expected) => {
    expect(sanitizeMicrosoftReturnTo(input)).toBe(expected);
  });

  it('persists a bounded credential-free descriptor for the current tab', () => {
    const now = Date.now();
    const flow = beginMicrosoftRedirectFlow(
      { pathname: '/profile', search: '?tab=cv', hash: '#experience' },
      sessionStorage,
      now,
    );

    expect(readMicrosoftRedirectFlow(sessionStorage, now)).toEqual(flow);
    expect(JSON.stringify(flow)).not.toMatch(/token|password|email/i);
  });

  it('rejects an expired descriptor', () => {
    const now = Date.now();
    beginMicrosoftRedirectFlow('/feed', sessionStorage, now);

    expect(
      readMicrosoftRedirectFlow(sessionStorage, now + (16 * 60 * 1000)),
    ).toBeNull();
  });

  it('marks completion for reload-safe navigation', () => {
    const flow = beginMicrosoftRedirectFlow('/academic');
    markMicrosoftRedirectFlowCompleted(flow);

    expect(readMicrosoftRedirectFlow()).toMatchObject({
      id: flow.id,
      returnTo: '/academic',
      completed: true,
    });
  });

  it('shares one completion promise for concurrent Strict Mode executions', async () => {
    const operation = vi.fn().mockResolvedValue('completed');

    const first = completeMicrosoftRedirectFlowOnce('flow-123456', operation);
    const second = completeMicrosoftRedirectFlowOnce('flow-123456', operation);

    await expect(Promise.all([first, second])).resolves.toEqual([
      'completed',
      'completed',
    ]);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('releases a failed flow so an explicit retry can run', async () => {
    const failure = vi.fn().mockRejectedValue(new Error('Identity failure'));
    await expect(
      completeMicrosoftRedirectFlowOnce('flow-123456', failure),
    ).rejects.toThrow('Identity failure');

    const retry = vi.fn().mockResolvedValue('retried');
    await expect(
      completeMicrosoftRedirectFlowOnce('flow-123456', retry),
    ).resolves.toBe('retried');
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
