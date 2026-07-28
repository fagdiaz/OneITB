import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { REQUEST_MAGIC_LINK, LOGIN_WITH_MAGIC_LINK } from '../../data/graphql/mutations/employer';
import useAuth from '../../hooks/useAuth';

const decodeJwtPayload = (jwt) => {
  const payload = jwt.split('.')[1];
  if (!payload) {
    throw new Error('El servidor devolvio una sesion invalida.');
  }

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = JSON.parse(window.atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));

  return {
    id: decoded.sub
      || decoded.nameid
      || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
    username: decoded.unique_name
      || decoded.name
      || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
    email: decoded.email
      || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
    role: decoded.role
      || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
  };
};

export const EmployerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [cuit, setCuit] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  const [requestMagicLink, { loading: loadingRequest }] = useMutation(REQUEST_MAGIC_LINK, {
    onCompleted: (data) => {
      setMessage(
        data?.requestMagicLink?.message
        || 'Si los datos son validos, recibiras un enlace de acceso por correo.',
      );
    },
    onError: (error) => setMessage(error.message),
  });

  const [loginWithMagicLink, { loading: loadingLogin }] = useMutation(LOGIN_WITH_MAGIC_LINK);

  useEffect(() => {
    const fragment = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : '';
    const candidate = new URLSearchParams(fragment).get('token')?.trim().toLowerCase() || '';

    if (window.location.hash) {
      window.history.replaceState(
        window.history.state,
        document.title,
        `${window.location.pathname}${window.location.search}`,
      );
    }

    if (/^[a-f0-9]{64}$/.test(candidate)) {
      setToken(candidate);
      setStep(2);
      setMessage('Enlace verificado. Confirma para iniciar la sesion.');
    } else if (candidate) {
      setMessage('El enlace de acceso no tiene un formato valido.');
    }
  }, []);

  const handleRequest = (event) => {
    event.preventDefault();
    setMessage('');
    requestMagicLink({
      variables: {
        email: email.trim().toLowerCase(),
        cuit: cuit.replace(/\D/g, ''),
      },
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const { data } = await loginWithMagicLink({ variables: { token } });
      const accessToken = data?.loginWithMagicLink;
      if (!accessToken) {
        throw new Error('No se pudo iniciar la sesion.');
      }

      const employer = decodeJwtPayload(accessToken);
      if (!employer.id || !employer.role) {
        throw new Error('La identidad recibida es incompleta.');
      }

      await login(accessToken, employer);
      navigate('/empleos/mis-ofertas', { replace: true });
    } catch (error) {
      setMessage(error.message || 'La credencial temporal no es valida o ya fue utilizada.');
      setToken('');
      setStep(1);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 font-inter dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-xl dark:border-white/10 dark:bg-slate-900">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Acceso a empleadores
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Ingresa de forma segura mediante una credencial temporal de un solo uso.
          </p>
        </div>

        {message && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center text-sm text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-200">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequest}>
            <div className="space-y-3">
              <div>
                <label htmlFor="employer-email" className="sr-only">Correo corporativo</label>
                <input
                  id="employer-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="relative block w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-white/10 dark:text-slate-100"
                  placeholder="Correo corporativo"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="employer-cuit" className="sr-only">CUIT de la empresa</label>
                <input
                  id="employer-cuit"
                  name="cuit"
                  type="text"
                  required
                  inputMode="numeric"
                  pattern="\d{11}"
                  maxLength={11}
                  className="relative block w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-white/10 dark:text-slate-100"
                  placeholder="CUIT de la empresa (11 digitos sin guiones)"
                  value={cuit}
                  onChange={(event) => setCuit(event.target.value.replace(/\D/g, '').slice(0, 11))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingRequest}
              className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-slate-50 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingRequest ? 'Procesando...' : 'Enviar enlace de acceso'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              El enlace temporal fue recibido de forma segura y se eliminó de la barra de direcciones.
            </p>

            <button
              type="submit"
              disabled={loadingLogin || !token}
              className="flex w-full justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-slate-50 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingLogin ? 'Ingresando...' : 'Ingresar al sistema'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
