import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { GraphQLProvider } from '../data/graphql/GraphqlProvider';
import { clearMicrosoftIdentitySession } from '../auth/microsoftEntra';

export const AuthContext = createContext();

export const AUTH_IDENTITY_PROVIDERS = Object.freeze({
  LOCAL: 'local',
  MICROSOFT: 'microsoft',
});

const readPersistedSession = () => {
  const storedToken = localStorage.getItem('token');
  const serializedUser = localStorage.getItem('user');
  if (!storedToken || !serializedUser) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }

  try {
    const storedUser = JSON.parse(serializedUser);
    if (!storedUser || typeof storedUser !== 'object' || !storedUser.id) {
      throw new Error('Invalid persisted user.');
    }

    return { token: storedToken, user: storedUser };
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [sessionVersion, setSessionVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const persistedSession = readPersistedSession();
    if (persistedSession) {
      setAuth(persistedSession.user);
      setToken(persistedSession.token);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const terminateLocalSession = useCallback(async (reason = 'manual') => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    GraphQLProvider.resetToken();
    GraphQLProvider.resetUser();

    setToken(null);
    setAuth({});
    setIsAuthenticated(false);
    setSessionVersion((current) => current + 1);

    await GraphQLProvider.invalidateSessionTransport();
    await clearMicrosoftIdentitySession();

    if (reason === 'expired') {
      sessionStorage.setItem('oneitb-session-expired', '1');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
  }, []);

  useEffect(() => (
    GraphQLProvider.registerSessionTerminationHandler(terminateLocalSession)
  ), [terminateLocalSession]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      const isRemoteLogout = event.key === 'token'
        && event.oldValue
        && event.newValue === null;
      if (isRemoteLogout) {
        void GraphQLProvider.requestSessionTermination('remote');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback(async (
    authToken,
    userObj,
    { identityProvider = AUTH_IDENTITY_PROVIDERS.LOCAL } = {},
  ) => {
    if (!authToken || !userObj?.id) {
      throw new Error('La sesion recibida no es valida.');
    }
    if (!Object.values(AUTH_IDENTITY_PROVIDERS).includes(identityProvider)) {
      throw new Error('El proveedor de identidad recibido no es valido.');
    }

    await GraphQLProvider.waitForSessionTermination();
    await GraphQLProvider.invalidateSessionTransport();
    if (identityProvider !== AUTH_IDENTITY_PROVIDERS.MICROSOFT) {
      await clearMicrosoftIdentitySession();
    }
    GraphQLProvider.resetSessionExpirationGuard();

    GraphQLProvider.setToken(authToken);
    GraphQLProvider.setUser(userObj);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userObj));

    setToken(authToken);
    setAuth(userObj);
    setIsAuthenticated(true);
    setSessionVersion((current) => current + 1);
  }, []);

  const logout = useCallback(() => (
    GraphQLProvider.requestSessionTermination('manual')
  ), []);

  return (
    <AuthContext.Provider
      value={{
        auth,
        isAuthenticated,
        isLoading,
        token,
        sessionVersion,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
