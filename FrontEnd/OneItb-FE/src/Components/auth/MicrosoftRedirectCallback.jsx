import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { MICROSOFT_LOGIN } from '../../data/graphql/mutations/authenticateUser';
import {
  clearMicrosoftIdentitySession,
  microsoftLoginRequest,
} from '../../auth/microsoftEntra';
import { AUTH_IDENTITY_PROVIDERS } from '../../context/AuthContext';
import {
  clearMicrosoftRedirectFlow,
  completeMicrosoftRedirectFlowOnce,
  markMicrosoftRedirectFlowCompleted,
  readMicrosoftRedirectFlow,
} from '../../auth/microsoftRedirectFlow';

const SESSION_COMMIT_TIMEOUT_MS = 10000;
const TOKEN_EXCHANGE_TIMEOUT_MS = 20000;

const authenticationErrorMessage = (error) => {
  const graphMessage = error?.graphQLErrors
    ?.map((item) => item.message)
    .filter(Boolean)
    .join(' ');
  return graphMessage
    || error?.message
    || 'No se pudo completar el acceso institucional.';
};

const interactionLabel = (inProgress, isSessionCommitPending) => {
  if (isSessionCommitPending) {
    return 'Preparando tu sesión institucional...';
  }
  if (inProgress === InteractionStatus.HandleRedirect) {
    return 'Procesando la respuesta de Microsoft...';
  }
  if (inProgress === InteractionStatus.AcquireToken) {
    return 'Validando el acceso institucional...';
  }
  return 'Autenticando con Microsoft...';
};

export const MicrosoftRedirectCallback = () => {
  const { instance, accounts, inProgress } = useMsal();
  const {
    auth,
    isAuthenticated,
    login,
    logout,
    sessionVersion,
    token,
  } = useAuth();
  const navigate = useNavigate();
  const attemptedFlowIdRef = useRef('');
  const exchangeAbortControllerRef = useRef(null);
  const sessionVersionRef = useRef(sessionVersion ?? 0);
  sessionVersionRef.current = sessionVersion ?? 0;
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingSession, setPendingSession] = useState(null);
  const [exchangeToken] = useMutation(MICROSOFT_LOGIN, {
    fetchPolicy: 'no-cache',
  });

  useEffect(() => () => {
    exchangeAbortControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (inProgress !== InteractionStatus.None) return undefined;

    let mounted = true;
    const flow = readMicrosoftRedirectFlow();

    if (!flow) {
      if (attemptedFlowIdRef.current) return undefined;
      setErrorMessage(
        'La solicitud de acceso expiró o no pertenece a esta pestaña. Volvé a iniciar sesión.',
      );
      return undefined;
    }

    if (flow.completed) {
      if (attemptedFlowIdRef.current === flow.id) return undefined;
      attemptedFlowIdRef.current = flow.id;
      setPendingSession({
        flow,
        resumeCompletedFlow: true,
        userId: null,
      });
      return undefined;
    }

    const activeAccount = instance.getActiveAccount?.();
    const account = activeAccount || (accounts.length === 1 ? accounts[0] : null);
    if (!account) {
      setErrorMessage(
        accounts.length > 1
          ? 'Microsoft devolvió varias cuentas sin identificar cuál inició el acceso. Volvé a iniciar sesión.'
          : 'Microsoft no devolvió una cuenta válida. Volvé a iniciar sesión.',
      );
      return undefined;
    }

    if (attemptedFlowIdRef.current === flow.id) return undefined;
    attemptedFlowIdRef.current = flow.id;

    void completeMicrosoftRedirectFlowOnce(flow.id, async () => {
      const expectedSessionVersion = sessionVersionRef.current + 1;
      instance.setActiveAccount?.(account);
      const tokenResult = await instance.acquireTokenSilent({
        ...microsoftLoginRequest,
        prompt: undefined,
        account,
      });
      const accessToken = tokenResult?.accessToken;
      if (!accessToken) {
        throw new Error('Microsoft no entregó un token para la API de OneITB.');
      }

      const exchangeController = new AbortController();
      exchangeAbortControllerRef.current = exchangeController;
      const exchangeTimeoutId = window.setTimeout(
        () => exchangeController.abort(),
        TOKEN_EXCHANGE_TIMEOUT_MS,
      );

      let data;
      try {
        ({ data } = await exchangeToken({
          variables: { accessToken },
          context: {
            fetchOptions: { signal: exchangeController.signal },
          },
        }));
      } catch (error) {
        if (exchangeController.signal.aborted) {
          throw new Error(
            'OneITB no respondió a tiempo. Verificá la conexión e intentá nuevamente.',
          );
        }
        throw error;
      } finally {
        window.clearTimeout(exchangeTimeoutId);
        if (exchangeAbortControllerRef.current === exchangeController) {
          exchangeAbortControllerRef.current = null;
        }
      }
      const payload = data?.microsoftLogin;
      if (!payload?.isAuthenticated || !payload.token || !payload.id) {
        throw new Error('OneITB no pudo iniciar la sesión institucional.');
      }

      await login(
        payload.token,
        {
          id: payload.id,
          username: payload.username,
          email: payload.email || account.username || '',
          role: payload.role,
        },
        { identityProvider: AUTH_IDENTITY_PROVIDERS.MICROSOFT },
      );
      return {
        flow,
        expectedSessionVersion,
        resumeCompletedFlow: false,
        userId: payload.id,
      };
    }).then((sessionToCommit) => {
      if (mounted) setPendingSession(sessionToCommit);
    }).catch(async (error) => {
      clearMicrosoftRedirectFlow(flow.id);
      await clearMicrosoftIdentitySession();
      if (mounted) setErrorMessage(authenticationErrorMessage(error));
    });

    return () => {
      mounted = false;
    };
  }, [accounts, exchangeToken, inProgress, instance, login, navigate]);

  useEffect(() => {
    if (!pendingSession) return undefined;

    const hasCanonicalSession = Boolean(isAuthenticated && token && auth?.id);
    const hasExpectedIdentity = pendingSession.resumeCompletedFlow
      ? hasCanonicalSession
      : hasCanonicalSession
        && String(auth.id) === String(pendingSession.userId)
        && sessionVersion >= pendingSession.expectedSessionVersion;

    if (hasExpectedIdentity) {
      if (!pendingSession.flow.completed) {
        markMicrosoftRedirectFlowCompleted(pendingSession.flow);
      }
      navigate(pendingSession.flow.returnTo, { replace: true });
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      clearMicrosoftRedirectFlow(pendingSession.flow.id);
      setErrorMessage(
        'La identidad fue validada, pero OneITB no pudo confirmar la sesión. Volvé a iniciar sesión.',
      );
      setPendingSession(null);
      void Promise.resolve(logout()).catch(() => clearMicrosoftIdentitySession());
    }, SESSION_COMMIT_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [
    auth?.id,
    isAuthenticated,
    logout,
    navigate,
    pendingSession,
    sessionVersion,
    token,
  ]);

  const returnToLogin = async () => {
    clearMicrosoftRedirectFlow();
    await clearMicrosoftIdentitySession();
    navigate('/login', { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-slate-100 p-8 text-center shadow-xl dark:border-white/10 dark:bg-slate-900">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-500/20"
          aria-hidden="true"
        >
          <i className={`fa-solid ${errorMessage ? 'fa-triangle-exclamation' : 'fa-shield-halved'}`} />
        </div>

        {errorMessage ? (
          <>
            <h1 className="mt-5 text-xl font-bold tracking-tight">
              No se pudo completar el acceso
            </h1>
            <p className="mt-3 text-sm leading-6 text-red-700 dark:text-red-300" role="alert">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={returnToLogin}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              Volver a iniciar sesión
            </button>
          </>
        ) : (
          <div role="status" aria-live="polite" aria-busy="true">
            <h1 className="mt-5 text-xl font-bold tracking-tight">
              {interactionLabel(inProgress, Boolean(pendingSession))}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              No cierres esta ventana. OneITB está verificando tu identidad institucional.
            </p>
            <span className="mx-auto mt-6 block h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" aria-hidden="true" />
          </div>
        )}
      </section>
    </main>
  );
};
