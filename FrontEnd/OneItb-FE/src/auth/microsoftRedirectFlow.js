import {
  MICROSOFT_CALLBACK_PATH,
  MICROSOFT_LOGIN_PATH,
} from './microsoftEntraConfig';

const FLOW_STORAGE_KEY = 'oneitb-microsoft-redirect-flow';
const FLOW_CHANGE_EVENT = 'oneitb:microsoft-redirect-flow-change';
const FLOW_TTL_MS = 15 * 60 * 1000;
const completionRegistry = new Map();

const currentStorage = (storage) => (
  storage ?? (typeof window === 'undefined' ? null : window.sessionStorage)
);

const notifyFlowChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(FLOW_CHANGE_EVENT));
  }
};

const destinationFromValue = (value) => {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';

  const pathname = typeof value.pathname === 'string' ? value.pathname : '';
  const search = typeof value.search === 'string' ? value.search : '';
  const hash = typeof value.hash === 'string' ? value.hash : '';
  return `${pathname}${search}${hash}`.trim();
};

export const sanitizeMicrosoftReturnTo = (value) => {
  const candidate = destinationFromValue(value);
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return '/feed';

  try {
    const internalOrigin = 'https://oneitb.invalid';
    const parsed = new URL(candidate, internalOrigin);
    if (parsed.origin !== internalOrigin) return '/feed';
    const normalizedPath = parsed.pathname.replace(/\/+$/, '') || '/';
    const isAuthenticationRoute = normalizedPath === MICROSOFT_LOGIN_PATH
      || normalizedPath === MICROSOFT_CALLBACK_PATH
      || normalizedPath === '/logout';
    return isAuthenticationRoute
      ? '/feed'
      : `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/feed';
  }
};

const createFlowId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const beginMicrosoftRedirectFlow = (
  returnTo,
  storage,
  now = Date.now(),
) => {
  const flow = {
    id: createFlowId(),
    returnTo: sanitizeMicrosoftReturnTo(returnTo),
    createdAt: now,
    completed: false,
  };
  currentStorage(storage)?.setItem(FLOW_STORAGE_KEY, JSON.stringify(flow));
  notifyFlowChange();
  return flow;
};

export const readMicrosoftRedirectFlow = (
  storage,
  now = Date.now(),
) => {
  const target = currentStorage(storage);
  const serialized = target?.getItem(FLOW_STORAGE_KEY);
  if (!serialized) return null;

  try {
    const flow = JSON.parse(serialized);
    const isValid = typeof flow?.id === 'string'
      && flow.id.length >= 8
      && Number.isFinite(flow.createdAt)
      && now - flow.createdAt >= 0
      && now - flow.createdAt <= FLOW_TTL_MS;
    if (!isValid) throw new Error('Invalid or expired redirect flow.');
    return {
      id: flow.id,
      returnTo: sanitizeMicrosoftReturnTo(flow.returnTo),
      createdAt: flow.createdAt,
      completed: flow.completed === true,
    };
  } catch {
    target?.removeItem(FLOW_STORAGE_KEY);
    return null;
  }
};

export const markMicrosoftRedirectFlowCompleted = (flow, storage) => {
  const target = currentStorage(storage);
  if (!flow?.id || !target) return;
  target.setItem(FLOW_STORAGE_KEY, JSON.stringify({
    ...flow,
    returnTo: sanitizeMicrosoftReturnTo(flow.returnTo),
    completed: true,
  }));
  notifyFlowChange();
};

export const clearMicrosoftRedirectFlow = (flowId, storage) => {
  const target = currentStorage(storage);
  if (!target) return;
  const current = readMicrosoftRedirectFlow(target);
  if (!flowId || current?.id === flowId) {
    target.removeItem(FLOW_STORAGE_KEY);
    notifyFlowChange();
  }
};

export const isMicrosoftRedirectFlowPending = (storage, now = Date.now()) => {
  const flow = readMicrosoftRedirectFlow(storage, now);
  return Boolean(flow && !flow.completed);
};

export const subscribeToMicrosoftRedirectFlow = (listener) => {
  if (typeof window === 'undefined' || typeof listener !== 'function') {
    return () => {};
  }

  window.addEventListener(FLOW_CHANGE_EVENT, listener);
  return () => window.removeEventListener(FLOW_CHANGE_EVENT, listener);
};

export const completeMicrosoftRedirectFlowOnce = (flowId, operation) => {
  if (!flowId || typeof operation !== 'function') {
    return Promise.reject(new Error('El flujo de autenticación no es válido.'));
  }

  const existing = completionRegistry.get(flowId);
  if (existing) return existing;

  const completion = Promise.resolve().then(operation);
  completionRegistry.set(flowId, completion);
  completion.catch(() => completionRegistry.delete(flowId));
  return completion;
};

export const resetMicrosoftRedirectCoordinatorForTests = () => {
  completionRegistry.clear();
};
