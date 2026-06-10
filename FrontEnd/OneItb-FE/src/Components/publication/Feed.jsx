import React from 'react'
import { useQuery } from '@apollo/client'
import { GET_USERS } from '../../data/graphql/queries/getUsers'
import useAuth from '../../hooks/useAuth'

/**
 * Feed — REFACTOR 037
 * 
 * Full Tailwind rewrite. Eliminates all BEM classes:
 *   content__header, content__title, content__button,
 *   content__posts, posts__post, post__container,
 *   post__image-user, post__user-image (was unconstrained — caused giant avatar),
 *   post__body, post__user-info, user-info__name, user-info__divider,
 *   user-info__create-date, post__content, post__buttons, post__button,
 *   content__container-btn, content__btn-more-post
 *
 * Each post is now a bg-white rounded-xl shadow-sm card.
 * Avatars are strictly constrained to w-10 h-10 rounded-full object-cover.
 */

// Mock posts data — replaces the duplicated hardcoded JSX blocks
const MOCK_POSTS = [
  {
    id: 'p1',
    author: 'Leandro Díaz',
    username: 'leandrodiaz',
    timeAgo: 'Hace 1 hora',
    content: 'Hola, buenos días a toda la comunidad ITB. ¡Empezamos la semana con todo!',
  },
  {
    id: 'p2',
    author: 'María García',
    username: 'mariagarcia',
    timeAgo: 'Hace 2 horas',
    content: '¿Alguien tiene apuntes de la materia de Redes? Los necesito para el parcial del viernes.',
  },
  {
    id: 'p3',
    author: 'Carlos López',
    username: 'carloslopez',
    timeAgo: 'Hace 3 horas',
    content: 'Recordatorio: mañana hay examen de Programación II. ¡Éxitos a todos!',
  },
  {
    id: 'p4',
    author: 'Ana Martínez',
    username: 'anamartinez',
    timeAgo: 'Hace 5 horas',
    content: 'Acabo de subir mis apuntes de Análisis Matemático al campus. Espero que les sirvan.',
  },
];

export const Feed = () => {
  const { auth } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

      {/* Page header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-blue-600 rounded-full" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Timeline</h1>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          Mostrar nuevas
        </button>
      </div>

      {/* Post cards */}
      {MOCK_POSTS.map((post) => (
        <article
          key={post.id}
          className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
        >
          {/* Post header: avatar + author info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar — strictly constrained */}
              <a href="#" className="shrink-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=3b82f6&color=fff&size=80`}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                  alt={`Avatar de ${post.author}`}
                />
              </a>

              {/* Name + timestamp */}
              <div className="min-w-0">
                <a
                  href="#"
                  className="block text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors truncate"
                >
                  {post.author}
                </a>
                <span className="text-xs text-slate-400">{post.timeAgo}</span>
              </div>
            </div>

            {/* Delete action */}
            <button
              type="button"
              className="text-slate-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50"
              title="Eliminar publicación"
            >
              <i className="fa-solid fa-trash-can text-sm" />
            </button>
          </div>

          {/* Post content */}
          <p className="text-sm text-slate-700 leading-relaxed">
            {post.content}
          </p>

          {/* Post reactions row */}
          <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-500 transition-colors"
            >
              <i className="fa-regular fa-thumbs-up" />
              Me gusta
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-500 transition-colors"
            >
              <i className="fa-regular fa-comment" />
              Comentar
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-500 transition-colors"
            >
              <i className="fa-solid fa-share-nodes" />
              Compartir
            </button>
          </div>
        </article>
      ))}

      {/* Load more */}
      <button
        type="button"
        className="w-full py-2.5 text-sm font-medium text-slate-500 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all"
      >
        Ver más publicaciones
      </button>

    </div>
  )
}
