import React, { useEffect, useState } from 'react';
import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import {
  clearMicrosoftIdentitySession,
  microsoftLoginRequest,
} from '../../auth/microsoftEntra';
import { MICROSOFT_CALLBACK_PATH } from '../../auth/microsoftEntraConfig';
import {
  beginMicrosoftRedirectFlow,
  clearMicrosoftRedirectFlow,
  readMicrosoftRedirectFlow,
} from '../../auth/microsoftRedirectFlow';

export const MicrosoftInstitutionalLogin = ({
  onError = () => {},
  returnTo = '/feed',
}) => {
  const { instance, accounts, inProgress } = useMsal();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isRedirecting || inProgress !== InteractionStatus.None) return;

    const flow = readMicrosoftRedirectFlow();
    if (!flow || flow.completed) return;

    const activeAccount = instance.getActiveAccount?.();
    const returnedAccount = activeAccount || (accounts.length === 1 ? accounts[0] : null);
    if (returnedAccount) {
      navigate(MICROSOFT_CALLBACK_PATH, { replace: true });
    }
  }, [accounts, inProgress, instance, isRedirecting, navigate]);

  const handleMicrosoftLogin = async () => {
    if (isRedirecting || inProgress !== InteractionStatus.None) return;

    const flow = beginMicrosoftRedirectFlow(returnTo);
    setIsRedirecting(true);
    onError('');

    try {
      await instance.loginRedirect(microsoftLoginRequest);
    } catch (error) {
      clearMicrosoftRedirectFlow(flow.id);
      await clearMicrosoftIdentitySession();
      onError(
        error.message || 'No se pudo iniciar el acceso institucional.',
      );
      setIsRedirecting(false);
    }
  };

  const loading = isRedirecting || inProgress !== InteractionStatus.None;
  const isHandlingRedirect = inProgress === InteractionStatus.HandleRedirect
    || inProgress === InteractionStatus.Startup;

  return (
    <button
      type="button"
      onClick={handleMicrosoftLogin}
      disabled={loading}
      aria-busy={loading}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-300/40 dark:hover:bg-slate-700"
    >
      <span
        aria-hidden="true"
        className="grid h-4 w-4 grid-cols-2 gap-0.5"
      >
        <span className="bg-[#f25022]" />
        <span className="bg-[#7fba00]" />
        <span className="bg-[#00a4ef]" />
        <span className="bg-[#ffb900]" />
      </span>
      {isHandlingRedirect
        ? 'Autenticando con Microsoft...'
        : loading
          ? 'Redirigiendo a Microsoft...'
          : 'Continuar con Microsoft 365'}
    </button>
  );
};
