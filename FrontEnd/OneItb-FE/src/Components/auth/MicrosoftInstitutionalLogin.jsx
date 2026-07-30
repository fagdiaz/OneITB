import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { MICROSOFT_LOGIN } from '../../data/graphql/mutations/authenticateUser';
import {
  clearMicrosoftIdentitySession,
  microsoftLoginRequest,
} from '../../auth/microsoftEntra';

export const MicrosoftInstitutionalLogin = ({
  onAuthenticated,
  onError,
}) => {
  const { instance, inProgress } = useMsal();
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [exchangeToken, { loading: isExchanging }] = useMutation(
    MICROSOFT_LOGIN,
    { fetchPolicy: 'no-cache' },
  );

  const handleMicrosoftLogin = async () => {
    setIsAcquiring(true);
    onError('');

    try {
      const interactiveResult = await instance.loginPopup(microsoftLoginRequest);
      let accessToken = interactiveResult.accessToken;
      if (!accessToken) {
        const silentResult = await instance.acquireTokenSilent({
          ...microsoftLoginRequest,
          prompt: undefined,
          account: interactiveResult.account,
        });
        accessToken = silentResult.accessToken;
      }
      if (!accessToken) {
        throw new Error('Microsoft no entregó un token para la API de OneITB.');
      }

      const { data } = await exchangeToken({
        variables: { accessToken },
      });
      const payload = data?.microsoftLogin;
      if (!payload?.isAuthenticated) {
        throw new Error('OneITB no pudo iniciar la sesión institucional.');
      }

      await onAuthenticated(
        payload,
        payload.email || interactiveResult.account?.username || '',
      );
    } catch (error) {
      await clearMicrosoftIdentitySession();
      const graphMessage = error.graphQLErrors
        ?.map((item) => item.message)
        .join(' ');
      const wasCancelled =
        error.errorCode === 'user_cancelled' ||
        error.errorCode === 'user_canceled';
      onError(
        wasCancelled
          ? 'Se canceló el acceso con Microsoft.'
          : graphMessage ||
            error.message ||
            'No se pudo completar el acceso institucional.',
      );
    } finally {
      setIsAcquiring(false);
    }
  };

  const loading =
    isAcquiring ||
    isExchanging ||
    inProgress !== InteractionStatus.None;

  return (
    <button
      type="button"
      onClick={handleMicrosoftLogin}
      disabled={loading}
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
      {loading ? 'Validando con Microsoft...' : 'Continuar con Microsoft 365'}
    </button>
  );
};
