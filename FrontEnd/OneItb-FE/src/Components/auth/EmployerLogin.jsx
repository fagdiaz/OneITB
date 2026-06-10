import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REQUEST_MAGIC_LINK, LOGIN_WITH_MAGIC_LINK } from '../../data/graphql/mutations/employer';

export const EmployerLogin = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [cuit, setCuit] = useState('');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');

    const [requestMagicLink, { loading: loadingRequest }] = useMutation(REQUEST_MAGIC_LINK, {
        onCompleted: () => {
            setMessage('¡Magic Link enviado! Revisa tu correo (para propósitos de demo, revisa la consola para ver el token).');
            setStep(2);
        },
        onError: (err) => {
            setMessage(err.message);
        }
    });

    const [loginWithMagicLink, { loading: loadingLogin }] = useMutation(LOGIN_WITH_MAGIC_LINK, {
        onCompleted: (data) => {
            setMessage('¡Inicio de sesión exitoso! (Token: ' + data.loginWithMagicLink + ')');
        },
        onError: (err) => {
            setMessage(err.message);
        }
    });

    const handleRequest = (e) => {
        e.preventDefault();
        requestMagicLink({ variables: { email, cuit } });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        loginWithMagicLink({ variables: { token } });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-inter">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Acceso a Empleadores
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Ingresa de forma segura sin contraseñas validando tu identidad con AFIP.
                    </p>
                </div>

                {message && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-4 rounded-lg text-sm text-center">
                        {message}
                    </div>
                )}

                {step === 1 ? (
                    <form className="mt-8 space-y-6" onSubmit={handleRequest}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="email" className="sr-only">Correo corporativo</label>
                                <input id="email" name="email" type="email" required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-transparent"
                                    placeholder="Correo corporativo"
                                    value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="cuit" className="sr-only">CUIT Empresa</label>
                                <input id="cuit" name="cuit" type="text" required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-transparent"
                                    placeholder="CUIT de la Empresa (11 dígitos sin guiones)"
                                    value={cuit} onChange={e => setCuit(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <button type="submit" disabled={loadingRequest}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50">
                                {loadingRequest ? 'Procesando...' : 'Solicitar Magic Link'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="token" className="sr-only">Token Magic Link</label>
                            <input id="token" name="token" type="text" required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-transparent"
                                placeholder="Pega el Token recibido..."
                                value={token} onChange={e => setToken(e.target.value)} />
                        </div>
                        <div>
                            <button type="submit" disabled={loadingLogin}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50">
                                {loadingLogin ? 'Ingresando...' : 'Ingresar al sistema'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
