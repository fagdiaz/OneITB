import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { CONFIRM_STUDENT_CAREER } from '../../data/graphql/mutations/careers';
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
  const [selectedCareerId, setSelectedCareerId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
  const [confirmStudentCareer, { loading: isSubmitting }] = useMutation(
    CONFIRM_STUDENT_CAREER,
  );

  const activeCareers = useMemo(
    () => normalizeActiveCareers(careersQuery.data?.careers),
    [careersQuery.data],
  );
  const selectedCareer = activeCareers.find((career) => career.id === selectedCareerId);

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

  const selectCareer = (careerId) => {
    setFormError('');
    setSelectedCareerId(careerId);
  };

  const requestConfirmation = (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!selectedCareer) {
      setFormError('Seleccioná una carrera para continuar.');
      return;
    }

    setFormError('');
    setShowConfirmation(true);
  };

  const confirmSelection = async () => {
    if (isSubmitting || !selectedCareer) return;

    setFormError('');
    try {
      const mutationResult = await confirmStudentCareer({
        variables: { careerId: selectedCareer.id },
      });
      const persistedId = Number(mutationResult.data?.confirmStudentCareer?.id);
      if (persistedId !== selectedCareer.id) {
        throw new Error('La API no confirmó la carrera seleccionada.');
      }

      const refreshed = await profileQuery.refetch();
      const refreshedProfile = refreshed.data?.me;
      const refreshedCareerIds = extractCareerIds(refreshedProfile);
      if (
        !isCurrentSessionProfile(auth, refreshedProfile)
        || refreshedCareerIds.length !== 1
        || refreshedCareerIds[0] !== selectedCareer.id
      ) {
        throw new Error(
          'La carrera se guardó, pero el perfil todavía no confirmó la asociación exacta.',
        );
      }

      navigate(destination, { replace: true });
    } catch (error) {
      setShowConfirmation(false);
      setFormError(getGraphQLErrorMessage(
        error,
        'No se pudo guardar tu identidad académica. Intentá nuevamente.',
      ));
    }
  };

  return (
    <AcademicOnboardingFrame
      title="Confirmá tu carrera actual"
      description="Elegí una única carrera. Esta identidad define las materias, publicaciones y recursos institucionales que vas a consultar."
    >
      <form onSubmit={requestConfirmation}>
        <fieldset disabled={isSubmitting}>
          <legend className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Carreras disponibles
          </legend>
          <div className="mt-3 grid max-h-72 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
            {activeCareers.map((career) => {
              const selected = selectedCareerId === career.id;
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
                    type="radio"
                    name="student-career"
                    checked={selected}
                    onChange={() => selectCareer(career.id)}
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
            disabled={isSubmitting || !selectedCareer}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-slate-50 shadow-lg shadow-blue-900/15 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Revisar y continuar'}
          </button>
        </div>
      </form>

      {showConfirmation && selectedCareer && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="career-confirmation-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-cyan-300/10 dark:text-cyan-200"
              aria-hidden="true"
            >
              <i className="fa-solid fa-graduation-cap" />
            </div>
            <h2
              id="career-confirmation-title"
              className="mt-4 text-xl font-black tracking-tight text-slate-950 dark:text-slate-50"
            >
              ¿Estás seguro de que esta es la carrera que estás cursando?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Vas a confirmar <strong>{selectedCareer.name}</strong>
              {selectedCareer.code ? ` (${selectedCareer.code})` : ''}. Esta selección define tu alcance académico actual.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmation(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Volver y revisar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirmSelection}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-slate-50 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Confirmando...' : 'Sí, confirmar carrera'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AcademicOnboardingFrame>
  );
};
