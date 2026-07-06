import React, { createContext, useCallback, useState, useEffect } from 'react';
import { GraphQLProvider } from '../data/graphql/GraphqlProvider';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);
    const [sessionVersion, setSessionVersion] = useState(0);
    // isLoading: true mientras se hidrata la sesión desde localStorage.
    // Evita que PrivateLayout redirija a /login antes de conocer el estado real.
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedToken && storedUser) {
            setAuth(storedUser);
            setToken(storedToken);
            setIsAuthenticated(true);
        }
        // Hydration complete — allow route guards to evaluate.
        setIsLoading(false);
    }, []);

    const login = useCallback(async (authToken, userObj) => {
        await GraphQLProvider.clearApolloStore();
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

    const logout = useCallback(async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        GraphQLProvider.resetToken();
        GraphQLProvider.resetUser();
        setToken(null);
        setAuth({});
        setIsAuthenticated(false);
        setSessionVersion((current) => current + 1);
        await GraphQLProvider.clearApolloStore();
    }, []);

    return (
        <AuthContext.Provider value={{ auth, isAuthenticated, isLoading, token, sessionVersion, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
