import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6">
      <div className="text-center max-w-lg">
        <h1 className="text-9xl font-extrabold text-blue-600 mb-4 tracking-tighter">
          404
        </h1>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Oops! Página no encontrada
        </h2>
        <div className="text-lg text-slate-600 mb-8 leading-relaxed">
          Parece que te has perdido en el campus... La ruta que estás buscando no existe o fue movida.
        </div>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};
