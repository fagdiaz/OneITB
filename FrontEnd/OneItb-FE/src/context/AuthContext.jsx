import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedToken && storedUser) {
            setAuth(storedUser);
            setToken(storedToken);
            setIsAuthenticated(true);
        }
    }, []);

    const login = (authToken, userObj) => {
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userObj));
        setToken(authToken);
        setAuth(userObj);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setAuth({});
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, isAuthenticated, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
