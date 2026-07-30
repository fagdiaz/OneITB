import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
  createHttpLink,
  split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { GeneralDataProvider } from '../GeneralDataProvider';

export const resolveHttpUri = () => {
  const configuredUri = import.meta.env.VITE_GRAPHQL_URL;
  if (configuredUri) return configuredUri;

  if (typeof window !== 'undefined') {
    return '/graphql';
  }

  return 'https://localhost:44397/graphql';
};

export const resolveWsUri = (httpEndpoint) => {
  const configuredUri = import.meta.env.VITE_GRAPHQL_WS_URL;
  if (configuredUri) return configuredUri;

  if (httpEndpoint.startsWith('http')) {
    return httpEndpoint.replace(/^http/, 'ws');
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${httpEndpoint.startsWith('/') ? httpEndpoint : `/${httpEndpoint}`}`;
  }

  return httpEndpoint;
};

const httpUri = resolveHttpUri();
const wsUri = resolveWsUri(httpUri);

let socketStatus = 'disconnected';
const socketListeners = new Set();
let sessionExpirationHandled = false;
let activeApolloClient = null;
let sessionEpoch = 0;
let sessionTerminationHandler = null;
let sessionTerminationPromise = null;

const clearActiveApolloStore = () => activeApolloClient?.clearStore?.() ?? Promise.resolve();

const publishSocketStatus = (status) => {
  socketStatus = status;
  socketListeners.forEach((listener) => {
    queueMicrotask(() => {
      if (socketListeners.has(listener)) listener(status);
    });
  });
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
const sessionBoundaryLink = new ApolloLink((operation, forward) => {
  const operationEpoch = sessionEpoch;

  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next: (value) => {
        if (operationEpoch === sessionEpoch) observer.next(value);
      },
      error: (error) => {
        if (operationEpoch === sessionEpoch) {
          observer.error(error);
        } else {
          observer.complete();
        }
      },
      complete: () => observer.complete(),
    });

    return () => subscription.unsubscribe();
  });
});

const isAuthorizationFailure = (graphQLErrors, networkError) => {
  const graphQLAuthFailure = graphQLErrors?.some((error) => {
    const code = error?.extensions?.code;
    const message = error?.message || '';
    return code === 'AUTH_NOT_AUTHORIZED'
      || code === 'AUTH_NOT_AUTHENTICATED'
      || code === 'AUTH_NOT_AUTHENTICATED_ERROR'
      || /not authorized|unauthorized|forbidden|jwt|token/i.test(message);
  });

  const statusCode = networkError?.statusCode || networkError?.response?.status;
  return graphQLAuthFailure || statusCode === 401 || statusCode === 403;
};

const handleSessionExpired = () => {
  const hadToken = Boolean(localStorage.getItem('token'));
  if (!hadToken || sessionExpirationHandled) return;

  sessionExpirationHandled = true;
  void GraphQLProvider.requestSessionTermination('expired');
};

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (!graphQLErrors?.length && !networkError) return;

  const definition = getMainDefinition(operation.query);
  const isSubscription = definition.kind === 'OperationDefinition'
    && definition.operation === 'subscription';
  const isExpectedPageShutdown = isSubscription
    && networkError?.message === 'Socket closed'
    && document.visibilityState === 'hidden';
  if (isExpectedPageShutdown) return;

  if (isAuthorizationFailure(graphQLErrors, networkError)) {
    handleSessionExpired();
    return;
  }

  console.error('GraphQL operation failed', JSON.stringify({
    operation: operation.operationName,
    graphQLErrors: graphQLErrors?.map(({ message, path }) => ({ message, path })),
    networkError: networkError?.message,
  }));
});

const transportLink = sessionBoundaryLink.concat(
  split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    authLink.concat(httpLink),
  ),
);

const replaceIncoming = (_existing, incoming) => incoming;

const createApolloClient = () => new ApolloClient({
  link: errorLink.concat(transportLink),
  cache: new InMemoryCache({
    typePolicies: {
      Message: {
        keyFields: ['id'],
      },
      User: {
        keyFields: ['id'],
      },
      Inquiry: {
        keyFields: ['id'],
      },
      Comment: {
        keyFields: ['id'],
      },
      Reaction: {
        keyFields: ['id'],
      },
      CommentReaction: {
        keyFields: ['id'],
      },
      SocialAttachment: {
        keyFields: ['id'],
      },
      AcademicResource: {
        keyFields: ['id'],
      },
      AcademicProgress: {
        keyFields: ['id'],
      },
      JobOffer: {
        keyFields: ['id'],
      },
      JobApplication: {
        keyFields: ['id'],
      },
      Subject: {
        keyFields: ['id'],
      },
      Career: {
        keyFields: ['id'],
      },
      Notification: {
        keyFields: ['id'],
      },
      AuditLog: {
        keyFields: ['id'],
      },
      Query: {
        fields: {
          me: {
            merge: replaceIncoming,
          },
          inquiriesPage: {
            keyArgs: ['searchTerm', 'careerId', 'careerIds', 'subjectIds', 'inquiryId', 'authorId'],
            merge: replaceIncoming,
          },
          conversation: {
            keyArgs: ['otherUserId'],
            merge: replaceIncoming,
          },
          messagingContacts: {
            keyArgs: false,
            merge: replaceIncoming,
          },
          activeConversations: {
            keyArgs: false,
            merge: replaceIncoming,
          },
          searchMyMessages: {
            keyArgs: ['searchTerm'],
            merge: replaceIncoming,
          },
          myNotifications: {
            keyArgs: ['first'],
            merge: replaceIncoming,
          },
          unreadNotificationCount: {
            merge: replaceIncoming,
          },
          myNotificationPreferences: {
            merge: replaceIncoming,
          },
          academicResources: {
            keyArgs: ['subjectId', 'searchTerm', 'category'],
            merge: replaceIncoming,
          },
          resourcesBySubject: {
            keyArgs: ['subjectId', 'searchTerm', 'category'],
            merge: replaceIncoming,
          },
          jobOffers: {
            keyArgs: ['onlyActive'],
            merge: replaceIncoming,
          },
          myJobOffers: {
            keyArgs: false,
            merge: replaceIncoming,
          },
          myAcademicProgress: {
            merge: replaceIncoming,
          },
          academicProgressForUser: {
            keyArgs: ['userId'],
            merge: replaceIncoming,
          },
          academicStudents: {
            keyArgs: ['subjectId'],
            merge: replaceIncoming,
          },
        },
      },
    },
  }),
});

export class GraphQLProvider extends GeneralDataProvider {
  constructor() {
    super();
    if (!activeApolloClient) {
      activeApolloClient = createApolloClient();
    }
    this.apolloInstance = activeApolloClient;
  }

  static clearApolloStore() {
    return clearActiveApolloStore();
  }

  static async invalidateSessionTransport() {
    sessionEpoch += 1;
    graphQLWsClient.terminate();
    publishSocketStatus('disconnected');
    try {
      await clearActiveApolloStore();
    } catch (error) {
      await activeApolloClient?.cache?.reset?.();
      console.error('Apollo session cleanup failed; normalized cache was reset.', error);
    }
  }

  static registerSessionTerminationHandler(handler) {
    sessionTerminationHandler = handler;
    return () => {
      if (sessionTerminationHandler === handler) {
        sessionTerminationHandler = null;
      }
    };
  }

  static requestSessionTermination(reason = 'manual') {
    if (sessionTerminationPromise) {
      return sessionTerminationPromise;
    }

    const handler = sessionTerminationHandler ?? (async (fallbackReason) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      GraphQLProvider.resetToken();
      GraphQLProvider.resetUser();
      await GraphQLProvider.invalidateSessionTransport();

      if (fallbackReason === 'expired') {
        sessionStorage.setItem('oneitb-session-expired', '1');
      }

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    });

    sessionTerminationPromise = Promise.resolve()
      .then(() => handler(reason))
      .finally(() => {
        sessionTerminationPromise = null;
      });

    return sessionTerminationPromise;
  }

  static waitForSessionTermination() {
    return sessionTerminationPromise ?? Promise.resolve();
  }

  static resetSessionExpirationGuard() {
    sessionExpirationHandled = false;
  }
}
