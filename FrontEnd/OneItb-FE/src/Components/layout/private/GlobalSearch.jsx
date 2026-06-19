import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_CAREERS } from '../../../data/graphql/queries/careers';
import { GET_SUBJECTS } from '../../../data/graphql/queries/subjects';

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCareerId, setSelectedCareerId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const { data: careersData } = useQuery(GET_CAREERS);
  const { data: subjectsData } = useQuery(GET_SUBJECTS, {
    variables: { careerId: selectedCareerId },
    skip: !selectedCareerId,
  });

  const careers = careersData?.careers || [];
  const subjects = subjectsData?.subjects || [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('q', searchTerm.trim());
    if (selectedCareerId) params.append('career', selectedCareerId);
    if (selectedSubjectId) params.append('subject', selectedSubjectId);
    
    setIsOpen(false);
    navigate(`/feed?${params.toString()}`);
  };

  const handleCareerSelect = (id) => {
    setSelectedCareerId(prev => prev === id ? null : id);
    setSelectedSubjectId(null);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCareerId(null);
    setSelectedSubjectId(null);
  };

  return (
    <div className="relative" ref={searchRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        aria-label="Buscar"
      >
        <i className="fa-solid fa-search text-sm" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-[350px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar publicaciones..."
                className="w-full rounded-full bg-slate-50 border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                autoFocus
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-slate-400 mb-2">Filtrar por Carrera</p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto scrollbar-hide">
                {careers.map(career => (
                  <button
                    key={career.id}
                    type="button"
                    onClick={() => handleCareerSelect(career.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
                      selectedCareerId === career.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{career.name}</span>
                    {career?.code && (
                      <span className={selectedCareerId === career.id ? 'text-blue-200' : 'text-slate-400'}>({career.code})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {selectedCareerId && (
              <div>
                <p className="text-xs font-bold uppercase text-slate-400 mb-2">Filtrar por Materia</p>
                {subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto scrollbar-hide">
                    {subjects.map(subject => (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => setSelectedSubjectId(prev => prev === subject.id ? null : subject.id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
                          selectedSubjectId === subject.id
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        <span>{subject.name}</span>
                        {subject?.code && (
                          <span className={selectedSubjectId === subject.id ? 'text-indigo-200' : 'text-indigo-400/70'}>({subject.code})</span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No hay materias para esta carrera.</p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                Aplicar Filtros y Buscar
              </button>
              
              {(searchTerm || selectedCareerId || selectedSubjectId) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
