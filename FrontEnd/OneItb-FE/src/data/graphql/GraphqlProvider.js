import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { GeneralDataProvider } from '../GeneralDataProvider';

const httpUri = import.meta.env.VITE_GRAPHQL_URL || 'https://localhost:44397/graphql';
const wsUri = import.meta.env.VITE_GRAPHQL_WS_URL || httpUri.replace(/^http/, 'ws');

let socketStatus = 'disconnected';
const socketListeners = new Set();

const publishSocketStatus = (status) => {
  socketStatus = status;
  socketListeners.forEach((listener) => listener(status));
};

export const subscribeToGraphQLWsStatus = (listener) => {
  socketListeners.add(listener);
  queueMicrotask(() => {
    if (socketListeners.has(listener)) listener(socketStatus);
  });
  return () => socketListeners.delete(listener);
};

export const graphQLWsClient = createClient({
  url: wsUri,
  lazy: true,
  retryAttempts: 8,
  connectionParams: () => {
    const token = localStorage.getItem('token');
    return {
      authorization: token ? `Bearer ${token}` : '',
    };
  },
  on: {
    connecting: () => publishSocketStatus('connecting'),
    connected: () => publishSocketStatus('connected'),
    closed: () => publishSocketStatus('disconnected'),
    error: () => publishSocketStatus('error'),
  },
});

const httpLink = createHttpLink({ uri: httpUri });
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});
const wsLink = new GraphQLWsLink(graphQLWsClient);
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (!graphQLErrors?.length && !networkError) return;

  console.error('GraphQL operation failed', JSON.stringify({
    operation: operation.operationName,
    graphQLErrors: graphQLErrors?.map(({ message, path }) => ({ message, path })),
    networkError: networkError?.message,
  }));
});

const transportLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink),
);

const createApolloClient = () => new ApolloClient({
  link: errorLink.concat(transportLink),
  cache: new InMemoryCache({
    typePolicies: {
      Message: {
        keyFields: ['id'],
      },
      Query: {
        fields: {
          conversation: {
            keyArgs: ['otherUserId'],
          },
          messagingContacts: {
            keyArgs: false,
          },
        },
      },
    },
  }),
});

export class GraphQLProvider extends GeneralDataProvider {
  constructor() {
    super();
    this.apolloInstance = createApolloClient();
  }
}
