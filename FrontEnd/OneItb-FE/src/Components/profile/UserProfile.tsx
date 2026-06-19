import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import useAuth from '../../hooks/useAuth';
import { GET_PUBLIC_PROFILE } from '../../data/graphql/queries/publicProfile';
import { GET_INQUIRIES } from '../../data/graphql/queries/inquiries';

export const UserProfile = () => {
  const { auth } = useAuth();
  const { id } = useParams();
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);

  const targetUserId = id || auth.id;

  const { data, loading, error } = useQuery(GET_PUBLIC_PROFILE, {
    variables: { userId: targetUserId },
    skip: !targetUserId,
    fetchPolicy: 'cache-and-network',
  });
  const { data: inquiriesData } = useQuery(GET_INQUIRIES, {
    variables: { searchTerm: null, careerId: null, subjectIds: null },
    skip: !auth.id,
    fetchPolicy: 'cache-and-network',
  });

  const profile = data?.publicProfile;
  const userPosts = useMemo(() => {
    const posts = inquiriesData?.inquiries ?? [];
    return posts.filter((post: any) => post.user?.id === targetUserId);
  }, [targetUserId, inquiriesData]);
  const visiblePosts = showAllPosts ? userPosts : userPosts.slice(0, 3);

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center py-20 text-sm font-medium text-slate-500">
        Cargando perfil...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudo cargar el perfil.
        </div>
      </div>
    );
  }

  const biography = profile.biography || 'Este usuario todavia no cargo una biografia.';

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=3b82f6&color=fff&size=128`}
            className="h-24 w-24 rounded-2xl object-cover shadow-sm"
            alt={`Avatar de ${profile.fullName}`}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">{profile.role}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{profile.fullName}</h1>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{biography}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(profile.careers || []).map((career: string) => (
                <span key={career} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {career}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowFullProfile(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Ver mas...
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Ultimas publicaciones</h2>
            <p className="text-xs text-slate-500">{userPosts.length} publicaciones activas</p>
          </div>
          {userPosts.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllPosts((current) => !current)}
              className="text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              {showAllPosts ? 'Ver menos' : 'Ver mas'}
            </button>
          )}
        </div>

        {visiblePosts.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Todavia no hay publicaciones para mostrar.</p>
        ) : (
          <div className="space-y-3">
            {visiblePosts.map((post: any) => (
              <article key={post.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-medium text-blue-700">{post.subject?.name}</p>
                <h3 className="mt-1 font-semibold text-slate-900">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {showFullProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
                <p className="text-sm text-slate-500">{profile.role}</p>
              </div>
              <button type="button" onClick={() => setShowFullProfile(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-slate-900">Biografia</dt>
                <dd className="mt-1 text-slate-600">{biography}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Contacto</dt>
                <dd className="mt-1 text-slate-600">{profile.phone || 'Sin telefono cargado.'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Redes</dt>
                <dd className="mt-1 grid gap-1 text-slate-600">
                  <span>LinkedIn: {profile.linkedIn || '-'}</span>
                  <span>Instagram: {profile.instagram || '-'}</span>
                  <span>Facebook: {profile.facebook || '-'}</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};
