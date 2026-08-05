import React, { useEffect, useState } from 'react'
import { useForm } from '../../hooks/useForm'
import { useMutation } from '@apollo/client'
import { AUTHENTICATE_USER } from '../../data/graphql/mutations/authenticateUser'
import useAuth from '../../hooks/useAuth'
import { useLocation, useNavigate } from 'react-router-dom'
import { MicrosoftInstitutionalLogin } from '../auth/MicrosoftInstitutionalLogin'
import { isMicrosoftIdentityAvailable } from '../../auth/microsoftEntra'

/**
 * Login — REFACTOR 037
 * Full Tailwind rewrite. Eliminates: content__header, content__title,
 * content__posts, form-login, form-group, btn, alert classes.
 * Logic is 100% preserved — only className attributes changed.
 */
export const Login = () => {
  const { form, changed } = useForm({});
  const [saved, setSaved] = useState('not_sended');
  const [loginError, setLoginError] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const {
    auth,
    isAuthenticated,
    isLoading: isSessionLoading,
    login,
    token,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (sessionStorage.getItem('oneitb-session-expired') !== '1') return;
    sessionStorage.removeItem('oneitb-session-expired');
    setSaved('error');
    setLoginError('Tu sesión ha expirado');
  }, []);

  useEffect(() => {
    const message = location.state?.registrationSuccess;
    if (!message) return;
    setRegistrationMessage(message);
    setSaved('registered');
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (isSessionLoading || !isAuthenticated || !token || !auth?.id) return;
    navigate('/feed', { replace: true });
  }, [auth?.id, isAuthenticated, isSessionLoading, navigate, token]);

  const loginUser = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const variables = {
        input: {
          email: form.email,
          password: form.password
        }
      };

      const { data } = await authenticateUser({ variables });

      // Spec-143: Apollo resuelve el await con data=undefined cuando el backend
      // devuelve graphQLErrors (ej: credenciales inválidas). El callback onError
      // ya habrá capturado el mensaje — aquí hacemos early-return para no crashear.
      if (!data?.login) return;

      const { token, username, isAuthenticated, id, role, email } = data.login;

      if (isAuthenticated) {
        await completeLogin(
          { token, username, isAuthenticated, id, role, email },
          form.email,
        );
      } else {
        setSaved('error');
        setLoginError('El backend rechazó las credenciales.');
      }
    } catch (err) {
      // Cubre fallos de red y casos donde Apollo sí relanza (errorPolicy distinta).
      const gqlMessage = err.graphQLErrors?.map((e) => e.message).join(' ');
      const netMessage = err.networkError?.result?.errors?.map((e) => e.message).join(' ');
      console.error('Login failed', err.graphQLErrors ?? err.networkError ?? err.message);
      setSaved('error');
      setLoginError(gqlMessage || netMessage || err.message || 'No se pudo completar el inicio de sesión.');
    }
  };

  const completeLogin = async (payload, fallbackEmail = '') => {
    const {
      token: authToken,
      username,
      isAuthenticated,
      id,
      role,
      email,
    } = payload;
    if (!isAuthenticated || !authToken || !id) {
      throw new Error('El backend rechazó las credenciales.');
    }

    await login(authToken, {
      id,
      username,
      email: email || fallbackEmail,
      role,
    });
    setSaved('login');
  };

  const handleMicrosoftError = (message) => {
    if (!message) {
      setSaved('not_sended');
      setLoginError('');
      return;
    }
    setSaved('error');
    setLoginError(message);
  };

  const [authenticateUser, { loading, error: mutationError }] = useMutation(AUTHENTICATE_USER, {
    fetchPolicy: 'network-only',
    onError: (err) => {
      // onError garantiza captura aunque useMutation no re-lance en modo "errorPolicy: none"
      const gqlMessage = err.graphQLErrors?.map((e) => e.message).join(' ');
      const netMessage = err.networkError?.result?.errors?.map((e) => e.message).join(' ');
      setSaved('error');
      setLoginError(gqlMessage || netMessage || err.message || 'Usuario o contraseña incorrectos.');
    },
  });

  if (isSessionLoading || (isAuthenticated && token && auth?.id)) {
    return (
      <main className="flex min-h-full items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm dark:border-white/10 dark:bg-slate-900"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" aria-hidden="true" />
          <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Preparando tu sesión institucional...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
              <i className="fa-solid fa-right-to-bracket text-white text-lg" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Iniciar Sesión</h1>
            <p className="text-sm text-slate-500 mt-1">Accedé a tu cuenta de OneITB</p>
          </div>

          {/* Alerts */}
          {saved === 'login' && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
              <i className="fa-solid fa-circle-check" />
              Usuario identificado. Redirigiendo...
            </div>
          )}
          {saved === 'registered' && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
              <i className="fa-solid fa-circle-check" />
              {registrationMessage || 'Cuenta creada correctamente. Ya podes iniciar sesion.'}
            </div>
          )}
          {saved === 'error' && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
              <i className="fa-solid fa-circle-exclamation" />
              {loginError || 'Credenciales incorrectas. Intentá de nuevo.'}
            </div>
          )}

          {/* Form */}
          <form onSubmit={loginUser} className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email institucional
              </label>
              <input
                id="email"
                type="email"
                name="email"
                onChange={changed}
                placeholder="usuario@itbeltran.com.ar"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  onChange={changed}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-11 text-sm text-slate-800 placeholder-slate-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 transition hover:text-slate-700"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>

          </form>

          {isMicrosoftIdentityAvailable() && (
            <>
              <div className="my-6 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  o
                </span>
                <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              </div>
              <MicrosoftInstitutionalLogin
                onError={handleMicrosoftError}
                returnTo={location.state?.from}
              />
              <p className="mt-3 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                Exclusivo para cuentas institucionales autorizadas de Microsoft 365.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
