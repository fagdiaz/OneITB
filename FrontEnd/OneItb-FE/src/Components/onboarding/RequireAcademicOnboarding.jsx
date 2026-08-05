import React from 'react';
import { useQuery } from '@apollo/client';
import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { GET_USER_PROFILE } from '../../data/graphql/queries/getUserProfile';
import { AcademicOnboardingLoading } from './AcademicOnboardingFrame';
import {
  ACADEMIC_ONBOARDING_PATH,
  requiresAcademicOnboarding,
} from './academicOnboardingState';
import { isMicrosoftRedirectFlowPending } from '../../auth/microsoftRedirectFlow';
import { MICROSOFT_CALLBACK_PATH } from '../../auth/microsoftEntraConfig';

export const RequireAcademicOnboarding = () => {
  const {
    auth,
    isAuthenticated,
    isLoading: isSessionLoading,
    token,
    sessionVersion,
  } = useAuth();
  const location = useLocation();
  const hasSession = Boolean(isAuthenticated && token && auth?.id);
  const {
    data,
    loading: isProfileLoading,
    error: profileError,
  } = useQuery(GET_USER_PROFILE, {
    skip: isSessionLoading || !hasSession,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    context: { sessionVersion },
  });

  if (isSessionLoading) {
    return <AcademicOnboardingLoading />;
  }

  if (!hasSession) {
    if (isMicrosoftRedirectFlowPending()) {
      return <Navigate to={MICROSOFT_CALLBACK_PATH} replace />;
    }
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  if (isProfileLoading) {
    return <AcademicOnboardingLoading />;
  }

  const profile = data?.me;
  const requiresRecovery = Boolean(
    profileError
    || !profile?.id
    || String(profile.id) !== String(auth.id),
  );
  if (requiresRecovery || requiresAcademicOnboarding(auth, profile)) {
    return (
      <Navigate
        to={ACADEMIC_ONBOARDING_PATH}
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
          profileRecoveryRequired: requiresRecovery,
        }}
      />
    );
  }

  return <Outlet />;
};
