import React, { useEffect, useState } from 'react';
import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { useLocation } from 'react-router-dom';
import {
  isMicrosoftRedirectFlowPending,
  subscribeToMicrosoftRedirectFlow,
} from '../../auth/microsoftRedirectFlow';
import { MICROSOFT_CALLBACK_PATH } from '../../auth/microsoftEntraConfig';
import { MicrosoftRedirectCallback } from './MicrosoftRedirectCallback';

export const MicrosoftRedirectBoundary = ({ children }) => {
  const { accounts, inProgress, instance } = useMsal();
  const location = useLocation();
  const [hasPendingFlow, setHasPendingFlow] = useState(
    () => isMicrosoftRedirectFlowPending(),
  );

  useEffect(() => subscribeToMicrosoftRedirectFlow(() => {
    setHasPendingFlow(isMicrosoftRedirectFlowPending());
  }), []);

  const hasReturnedAccount = Boolean(
    instance.getActiveAccount?.() || accounts.length > 0,
  );
  const isMsalInteractionActive = inProgress !== InteractionStatus.None;
  const isCallbackRoute = location.pathname === MICROSOFT_CALLBACK_PATH;
  const mustOwnTransition = hasPendingFlow
    && !isCallbackRoute
    && (isMsalInteractionActive || hasReturnedAccount);

  return mustOwnTransition ? <MicrosoftRedirectCallback /> : children;
};
