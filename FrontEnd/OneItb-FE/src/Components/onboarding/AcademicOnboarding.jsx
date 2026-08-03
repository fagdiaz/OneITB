import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { LINK_USER_TO_CAREERS } from '../../data/graphql/mutations/careers';
import { GET_CAREERS } from '../../data/graphql/queries/careers';
import { GET_USER_PROFILE } from '../../data/graphql/queries/getUserProfile';
import {
  AcademicOnboardingFrame,
  AcademicOnboardingLoading,
} from './AcademicOnboardingFrame';
import {
  extractCareerIds,
  getGraphQLErrorMessage,
  isCurrentSessionProfile,
  normalizeActiveCareers,
  normalizeCareerSelection,
  requiresAcademicOnboarding,
  sanitizeOnboardingDestination,
} from './academicOnboardingState';

const RecoveryActions = ({
  isRetrying,
  onRetry,
  onLogout,
}) => (
  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
    <button
      type="button"
      disabled={isRetrying}
      onClick={onRetry}
      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-slate-50 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isRetrying ? 'Reintentando...' : 'Reintentar'}
    </button>
    <button
      type="button"
      onClick={onLogout}
      className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
    >
      Cerrar sesión
    </button>
  </div>
);

export const AcademicOnboarding = () => {
  const {
    auth,
    isAuthenticated,
    isLoading: isSessionLoading,
    logout,
    sessionVersion,
    token,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const destination = sanitizeOnboardingDestination(location.state?.from);
  const hasSession = Boolean(isAuthenticated && token && auth?.id);
  const [selectedCareerIds, setSelectedCareerIds] = useState([]);
  const [formError, setFormError] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  const profileQuery = useQuery(GET_USER_PROFILE, {
    skip: isSessionLoading || !hasSession,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    context: { sessionVersion },
  });
  const careersQuery = useQuery(GET_CAREERS, {
    skip: isSessionLoading || !hasSession,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    context: { sessionVersion },
  });
  const [linkUserToCareers, { loading: isSubmitting }] = useMutation(
    LINK_USER_TO_CAREERS,
  );

  const activeCareers = useMemo(
    () => normalizeActiveCareers(careersQuery.data?.careers),
    [careersQuery.data],
  );

  if (isSessionLoading) {
    return <AcademicOnboardingLoading />;
  }

  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  if (profileQuery.loading || careersQuery.loading) {
    return <AcademicOnboardingLoading />;
  }

  const profile = profileQuery.data?.me;
  const profileIsCurrent = isCurrentSessionProfile(auth, profile);
  const queryError = profileQuery.error || careersQuery.error;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setFormError('');
    try {
      await Promise.all([
        profileQuery.refetch(),
        careersQuery.refetch(),
      ]);
    } catch (error) {
      setFormError(getGraphQLErrorMessage(
        error,
        'No se pudo actualizar la configuración. Intentá nuevamente.',
      ));
    } finally {
      setIsRetrying(false);
    }
  };

  if (queryError || !profileIsCurrent) {
    return (
      <AcademicOnboardingFrame
        title="No pudimos validar tu identidad académica"
        description="La plataforma no habilitará módulos privados con datos incompletos o de otra sesión."
      >
        <div
          role="alert"
          className="rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-300/20 dark:bg-amber-400/10 dark:text-amber-100"
        >
          {formError || getGraphQLErrorMessage(
            queryError,
            'No se pudo obtener un perfil válido para la sesión actual.',
          )}
        </div>
        <RecoveryActions
          isRetrying={isRetrying}
          onRetry={handleRetry}
          onLogout={handleLogout}
        />
      </AcademicOnboardingFrame>
    );
  }

  if (!requiresAcademicOnboarding(auth, profile)) {
    return <Navigate to={destination} replace />;
  }

  if (activeCareers.length === 0) {
    return (
      <AcademicOnboardingFrame
        title="No hay carreras disponibles"
        description="El catálogo institucional no contiene carreras activas. No se guardará una configuración incompleta."
      >
        <div
          role="alert"
          className="rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-300/20 dark:bg-amber-400/10 dark:text-amber-100"
        >
          {formError || 'Reintentá la consulta o cerrá sesión para usar otra cuenta.'}
        </div>
        <RecoveryActions
          isRetrying={isRetrying}
          onRetry={handleRetry}
          onLogout={handleLogout}
        />
      </AcademicOnboardingFrame>
    );
  }

  const toggleCareer = (careerId) => {
    setFormError('');
    setSelectedCareerIds((current) => (
      current.includes(careerId)
        ? current.filter((id) => id !== careerId)
        : [...current, careerId]
    ));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const normalizedIds = normalizeCareerSelection(selectedCareerIds);
    if (normalizedIds.length === 0) {
      setFormError('Seleccioná al menos una carrera para continuar.');
      return;
    }

    setFormError('');
    try {
      const mutationResult = await linkUserToCareers({
        variables: { careerIds: normalizedIds },
      });
      const persistedIds = normalizeCareerSelection(
        mutationResult.data?.linkUserToCareers?.map((career) => career.id),
      );
      if (!normalizedIds.every((id) => persistedIds.includes(id))) {
        throw new Error('La API no confirmó todas las carreras seleccionadas.');
      }

      const refreshed = await profileQuery.refetch();
      const refreshedProfile = refreshed.data?.me;
      if (
        !isCurrentSessionProfile(auth, refreshedProfile)
        || extractCareerIds(refreshedProfile).length === 0
      ) {
        throw new Error(
          'La carrera se guardó, pero el perfil todavía no confirmó la asociación.',
        );
      }

      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(getGraphQLErrorMessage(
        error,
        'No se pudo guardar tu identidad académica. Intentá nuevamente.',
      ));
    }
  };

  return (
    <AcademicOnboardingFrame
      title="Elegí tu carrera"
      description="Esta información permite mostrarte materias, publicaciones y recursos vinculados con tu recorrido institucional."
    >
      <form onSubmit={handleSubmit}>
        <fieldset disabled={isSubmitting}>
          <legend className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Carreras disponibles
          </legend>
          <div className="mt-3 grid max-h-72 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
            {activeCareers.map((career) => {
              const selected = selectedCareerIds.includes(career.id);
              return (
                <label
                  key={career.id}
                  className={[
                    'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition',
                    selected
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/15 dark:border-cyan-300/50 dark:bg-cyan-300/10'
                      : 'border-slate-200 bg-slate-50/80 hover:border-blue-300 dark:border-white/10 dark:bg-slate-900/55 dark:hover:border-cyan-300/30',
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleCareer(career.id)}
                    className="mt-0.5 h-4 w-4 accent-blue-600"
                  />
                  <span>
                    <span className="block text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {career.name}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {career.code || `Carrera #${career.id}`}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {formError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-300/20 dark:bg-red-500/10 dark:text-red-200"
          >
            {formError}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
          >
            Cerrar sesión
          </button>
          <button
            type="submit"
            disabled={isSubmitting || selectedCareerIds.length === 0}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-slate-50 shadow-lg shadow-blue-900/15 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </div>
      </form>
    </AcademicOnboardingFrame>
  );
};
