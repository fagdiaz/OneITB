import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { GET_INQUIRIES_PAGE } from '../../data/graphql/queries/inquiries';
import { GET_MY_FOLLOWED_USER_IDS } from '../../data/graphql/social';
import { Feed } from './Feed';

vi.mock('../../hooks/useAuth', () => ({
  default: () => ({ auth: { id: 'current-student', role: 'Estudiante' } }),
}));

it('resolves the route ID regardless of list filters and handles an unavailable post', async () => {
  const id = '10000000-0000-0000-0000-000000000001';
  const read = vi.fn(() => ({ data: { inquiriesPage: {
    __typename: 'InquiryPage', items: [], totalCount: 0, hasNextPage: false, nextCursor: '',
  } } }));
  const mocks = [
    { request: { query: GET_INQUIRIES_PAGE, variables: {
      inquiryId: id, after: null, first: 1, authorId: null, careerId: null,
      careerIds: null, subjectIds: null, searchTerm: null,
    } }, result: read },
    { request: { query: GET_MY_FOLLOWED_USER_IDS }, result: { data: { myFollowedUserIds: [] } } },
  ];
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={[`/post/${id}?career=9&q=otro&inquiryId=otro`]}>
        <Routes><Route path="/post/:id" element={<Feed />} /></Routes>
      </MemoryRouter>
    </MockedProvider>,
  );
  expect(await screen.findByText('La publicación no está disponible.')).toBeVisible();
  expect(read).toHaveBeenCalledOnce();
  expect(screen.queryByRole('button', { name: 'Publicar' })).toBeNull();
  expect(screen.getByRole('link', { name: 'Volver al muro' })).toHaveAttribute('href', '/feed');
});
