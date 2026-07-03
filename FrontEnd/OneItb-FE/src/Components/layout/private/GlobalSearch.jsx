import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { GET_SUBJECTS } from '../../../data/graphql/queries/subjects';
import { GET_USER_PROFILE } from '../../../data/graphql/queries/getUserProfile';
import { GET_CAREERS } from '../../../data/graphql/queries/careers';
import { SEARCH_PUBLIC_PROFILES } from '../../../data/graphql/queries/searchPublicProfiles';
import { apiBaseUrl } from '../../../utils/uploadFile';

const resolveAssetUrl = (value) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  if (value.startsWith('/')) return `${apiBaseUrl}${value}`;
  return value;
};

const getInitials = (name = 'U') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const toggleNumber = (items, id) =>
  items.includes(id) ? items.filter((item) => item !== id) : [...items, id];

export const GlobalSearch = () => {
  const { auth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCareerIds, setSelectedCareerIds] = useState([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const canSearchGlobally = auth?.role === 'Administrador' || auth?.role === 'Moderador';

  const { data: meData } = useQuery(GET_USER_PROFILE, {
    skip: !auth?.id,
    fetchPolicy: 'cache-first',
  });
  const { data: careersData } = useQuery(GET_CAREERS, {
    skip: !auth?.id,
    fetchPolicy: 'cache-first',
  });

  const myCareers = useMemo(
    () =>
      (meData?.me?.userCareers ?? [])
        .map((link) => link?.career)
        .filter((career) => career?.id && career?.isActive !== false),
    [meData],
  );

  const careerOptions = canSearchGlobally ? careersData?.careers ?? [] : myCareers;
  const effectiveCareerIds = useMemo(
    () =>
      selectedCareerIds.length > 0
        ? selectedCareerIds
        : canSearchGlobally
          ? []
          : myCareers.map((career) => career.id),
    [canSearchGlobally, myCareers, selectedCareerIds],
  );
  const subjectQueryCareerId = effectiveCareerIds.length === 1 ? effectiveCareerIds[0] : null;

  const { data: subjectsData } = useQuery(GET_SUBJECTS, {
    variables: { careerId: subjectQueryCareerId },
    skip: !auth?.id,
    fetchPolicy: 'cache-first',
  });

  const trimmedTerm = searchTerm.trim();
  const { data: profilesData } = useQuery(SEARCH_PUBLIC_PROFILES, {
    variables: { searchTerm: trimmedTerm, first: 5 },
    skip: trimmedTerm.length < 2,
    fetchPolicy: 'cache-and-network',
  });

  const subjects = useMemo(() => {
    const allSubjects = subjectsData?.subjects || [];
    if (effectiveCareerIds.length === 0) return allSubjects;
    return allSubjects.filter((subject) => effectiveCareerIds.includes(subject.career?.id));
  }, [effectiveCareerIds, subjectsData]);
  const profileResults = profilesData?.searchPublicProfiles || [];
  const matchingSubjects = useMemo(() => {
    if (trimmedTerm.length < 2) return [];
    const normalizedTerm = trimmedTerm.toLowerCase();
    return subjects
      .filter((subject) =>
        [subject.code, subject.name]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedTerm)),
      )
      .slice(0, 6);
  }, [subjects, trimmedTerm]);
  const activeSearch = isOpen || (location.pathname.startsWith('/feed') && Boolean(location.search));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!careerOptions.length) return;
    const validCareerIds = new Set(careerOptions.map((career) => career.id));
    setSelectedCareerIds((current) => {
      const next = current.filter((id) => validCareerIds.has(id));
      return next.length === current.length ? current : next;
    });
  }, [careerOptions]);

  useEffect(() => {
    if (!subjects.length) {
      setSelectedSubjectIds((current) => (current.length === 0 ? current : []));
      return;
    }
    const validSubjectIds = new Set(subjects.map((subject) => subject.id));
    setSelectedSubjectIds((current) => {
      const next = current.filter((id) => validSubjectIds.has(id));
      return next.length === current.length ? current : next;
    });
  }, [subjects]);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (trimmedTerm) params.append('q', trimmedTerm);
    if (effectiveCareerIds.length > 0) params.append('careers', effectiveCareerIds.join(','));
    if (selectedSubjectIds.length > 0) params.append('subjects', selectedSubjectIds.join(','));

    setIsOpen(false);
    navigate(params.toString() ? `/feed?${params.toString()}` : '/feed');
  };

  const handleProfileNavigate = (userId) => {
    setIsOpen(false);
    navigate(`/profile/${userId}`);
  };

  const handleCareerToggle = (careerId) => {
    const currentEffective = selectedCareerIds.length > 0
      ? selectedCareerIds
      : canSearchGlobally
        ? []
        : careerOptions.map((career) => career.id);
    const next = currentEffective.includes(careerId)
      ? currentEffective.filter((id) => id !== careerId)
      : [...currentEffective, careerId];

    setSelectedCareerIds(next);
    setSelectedSubjectIds([]);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCareerIds([]);
    setSelectedSubjectIds([]);
  };

  return (
    <div className="relative h-9 w-9 shrink-0" ref={searchRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={[
          'flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ease-out',
          'hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/10 hover:text-white',
          'hover:shadow-[0_4px_14px_rgba(59,130,246,0.35),0_1px_4px_rgba(0,0,0,0.25)]',
          activeSearch
            ? 'border-blue-300/30 bg-white/10 text-white ring-1 ring-blue-300/20 shadow-[0_4px_14px_rgba(59,130,246,0.34)]'
            : 'border-transparent bg-slate-800 text-slate-300',
        ].join(' ')}
        aria-label="Buscar"
        aria-expanded={isOpen}
      >
        <i className="fa-solid fa-search text-sm" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-[70] mt-2 w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-slate-950/95 p-3 text-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex h-10 items-center gap-2 rounded-full border border-blue-300/30 bg-white/10 px-3 ring-1 ring-blue-300/20">
              <i className="fa-solid fa-search text-sm text-blue-200" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar publicaciones o perfiles..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-slate-400 outline-none"
                autoFocus
              />
              {(searchTerm || selectedCareerIds.length > 0 || selectedSubjectIds.length > 0) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Limpiar busqueda"
                >
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              )}
            </div>

            {careerOptions.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <details>
                  <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Carreras ({effectiveCareerIds.length || (canSearchGlobally ? 'todas' : myCareers.length)})
                  </summary>
                  <div className="mt-2 grid max-h-32 gap-1.5 overflow-y-auto pr-1">
                    {careerOptions.map((career) => (
                      <label
                        key={career.id}
                        className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                      >
                        <input
                          type="checkbox"
                          checked={effectiveCareerIds.includes(career.id)}
                          onChange={() => handleCareerToggle(career.id)}
                          className="h-3.5 w-3.5 rounded border-white/20 bg-slate-900 text-blue-500"
                        />
                        <span className="min-w-0 truncate">
                          {career.code ? `${career.code} - ${career.name}` : career.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {subjects.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <details>
                  <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Materias ({selectedSubjectIds.length || 'todas'})
                  </summary>
                  <div className="mt-2 grid max-h-36 gap-1.5 overflow-y-auto pr-1">
                    {subjects.map((subject) => (
                      <label
                        key={subject.id}
                        className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubjectIds.includes(subject.id)}
                          onChange={() => setSelectedSubjectIds((current) => toggleNumber(current, subject.id))}
                          className="h-3.5 w-3.5 rounded border-white/20 bg-slate-900 text-indigo-500"
                        />
                        <span className="min-w-0 truncate">
                          {[subject.code, subject.name].filter(Boolean).join(' - ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {trimmedTerm.length >= 2 && matchingSubjects.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Materias
                </p>
                <div className="mt-2 grid gap-1.5">
                  {matchingSubjects.map((subject) => (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => {
                        setSelectedSubjectIds((current) =>
                          current.includes(subject.id) ? current : [...current, subject.id],
                        );
                        if (subject.career?.id) {
                          setSelectedCareerIds((current) =>
                            current.includes(subject.career.id) ? current : [...current, subject.career.id],
                          );
                        }
                      }}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition hover:bg-white/10"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-bold text-white">{subject.name}</span>
                        <span className="block truncate text-slate-400">
                          {[subject.code, subject.career?.name].filter(Boolean).join(' - ')}
                        </span>
                      </span>
                      <i className="fa-solid fa-filter text-[10px] text-indigo-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {trimmedTerm.length >= 2 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Perfiles
                </p>
                <div className="mt-2 space-y-1.5">
                  {profileResults.length === 0 ? (
                    <p className="rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-slate-500">
                      Sin perfiles coincidentes.
                    </p>
                  ) : (
                    profileResults.map((profile) => {
                      const avatarUrl = resolveAssetUrl(profile.avatarUrl);
                      return (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => handleProfileNavigate(profile.id)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/10"
                        >
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={`Avatar de ${profile.fullName}`}
                              className="h-9 w-9 rounded-full object-cover ring-1 ring-white/15"
                            />
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-black text-slate-200 ring-1 ring-white/10">
                              {getInitials(profile.fullName)}
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-white">{profile.fullName}</span>
                            <span className="block truncate text-xs text-slate-400">
                              {[profile.role, ...(profile.careers || []).slice(0, 1)].filter(Boolean).join(' - ')}
                            </span>
                          </span>
                          <i className="fa-solid fa-arrow-right text-xs text-slate-500" />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-500"
            >
              <i className="fa-solid fa-newspaper text-xs" />
              Realizar busqueda
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
