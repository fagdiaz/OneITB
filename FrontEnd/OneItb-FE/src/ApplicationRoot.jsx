import React, { useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import App from './App';
import { GlobalErrorBoundary } from './Components/layout/GlobalErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { GraphQLProvider } from './data/graphql/GraphqlProvider';
import { MicrosoftIdentityProvider } from './auth/MicrosoftIdentityProvider';
export { initializeMicrosoftIdentity } from './auth/microsoftEntra';

const createDefaultApolloClient = () => new GraphQLProvider().apolloInstance;

export const AppProviders = ({
  children,
  clientFactory = createDefaultApolloClient,
  ApolloProviderComponent = ApolloProvider,
  ThemeProviderComponent = ThemeProvider,
  MicrosoftIdentityProviderComponent = MicrosoftIdentityProvider,
}) => {
  const [apolloClient] = useState(() => clientFactory());

  return (
    <ApolloProviderComponent client={apolloClient}>
      <MicrosoftIdentityProviderComponent>
        <ThemeProviderComponent>
          {children}
        </ThemeProviderComponent>
      </MicrosoftIdentityProviderComponent>
    </ApolloProviderComponent>
  );
};

export const ApplicationRoot = ({ children, ...providerOverrides }) => (
  <GlobalErrorBoundary>
    <AppProviders {...providerOverrides}>
      {children ?? <App />}
    </AppProviders>
  </GlobalErrorBoundary>
);
