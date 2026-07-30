import React from 'react';
import { MsalProvider } from '@azure/msal-react';
import { getMicrosoftIdentityInstance } from './microsoftEntra';

export const MicrosoftIdentityProvider = ({ children }) => {
  const instance = getMicrosoftIdentityInstance();
  if (!instance) return children;

  return (
    <MsalProvider instance={instance}>
      {children}
    </MsalProvider>
  );
};
