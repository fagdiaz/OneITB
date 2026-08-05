import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  beginMicrosoftRedirectFlow,
  clearMicrosoftRedirectFlow,
  completeMicrosoftRedirectFlowOnce,
  isMicrosoftRedirectFlowPending,
  markMicrosoftRedirectFlowCompleted,
  readMicrosoftRedirectFlow,
  resetMicrosoftRedirectCoordinatorForTests,
  sanitizeMicrosoftReturnTo,
  subscribeToMicrosoftRedirectFlow,
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

  it('exposes only non-completed flows as pending', () => {
    const flow = beginMicrosoftRedirectFlow('/academic');
    expect(isMicrosoftRedirectFlowPending()).toBe(true);

    markMicrosoftRedirectFlowCompleted(flow);
    expect(isMicrosoftRedirectFlowPending()).toBe(false);
  });

  it('notifies same-tab consumers when the redirect flow changes', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToMicrosoftRedirectFlow(listener);

    const flow = beginMicrosoftRedirectFlow('/profile');
    clearMicrosoftRedirectFlow(flow.id);

    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    beginMicrosoftRedirectFlow('/feed');
    expect(listener).toHaveBeenCalledTimes(2);
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
