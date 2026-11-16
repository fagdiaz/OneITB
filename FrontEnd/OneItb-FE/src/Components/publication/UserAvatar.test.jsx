import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  UserAvatar,
  ParticipationBadges,
  getParticipationBadges,
  getRoleStyle,
  resolveAvatarUrl,
  getInitials,
  getNameInitials,
  roleStyles,
} from './UserAvatar';

describe('UserAvatar Component and Helpers', () => {
  describe('Initials and Formatting Helpers', () => {
    it('returns initials from firstName and lastName', () => {
      expect(getInitials('Ana', 'Gomez')).toBe('AG');
      expect(getInitials('Carlos', '')).toBe('C');
      expect(getInitials('', 'Perez')).toBe('P');
      expect(getInitials('', '')).toBe('?');
      expect(getInitials(null, null)).toBe('?');
    });

    it('returns initials from full name string', () => {
      expect(getNameInitials('Lucas Silva')).toBe('LS');
      expect(getNameInitials('Martin')).toBe('M');
      expect(getNameInitials('')).toBe('U');
      expect(getNameInitials(undefined)).toBe('U');
    });

    it('resolves avatar URLs properly across absolute, data and relative paths', () => {
      expect(resolveAvatarUrl(null)).toBeNull();
      expect(resolveAvatarUrl({})).toBeNull();
      expect(resolveAvatarUrl({ avatarUrl: 'https://images.example.com/avatar.jpg' })).toBe('https://images.example.com/avatar.jpg');
      expect(resolveAvatarUrl({ avatarUrl: 'data:image/png;base64,abc' })).toBe('data:image/png;base64,abc');
      expect(resolveAvatarUrl({ avatarUrl: '/uploads/avatar1.jpg' })).toContain('/uploads/avatar1.jpg');
    });
  });

  describe('Role Styles Mapping', () => {
    const roles = ['Administrador', 'Moderador', 'Profesor', 'Estudiante', 'Egresado', 'Empleador'];

    it.each(roles)('returns correct styles for role %s', (role) => {
      const style = getRoleStyle(role);
      expect(style).toBeDefined();
      expect(style.name).toContain('text-');
      expect(style.badge).toBeDefined();
      expect(style.label).toBe(roleStyles[role].label);
    });

    it('falls back to default style for unknown role', () => {
      const style = getRoleStyle('Invitado');
      expect(style.label).toBe('Invitado');
      expect(style.name).toContain('slate');
    });
  });

  describe('Participation Badges', () => {
    it('returns empty array when thresholds are not met', () => {
      expect(getParticipationBadges({ totalPosts: 5, totalComments: 10, totalLikesReceived: 20 })).toEqual([]);
    });

    it('assigns badges when thresholds are met', () => {
      const badges = getParticipationBadges({ totalPosts: 12, totalComments: 25, totalLikesReceived: 30 });
      expect(badges.map((b) => b.label)).toEqual(['Publicador', 'Conversador', 'Valorado']);
    });

    it('renders null when user has no badges', () => {
      const { container } = render(<ParticipationBadges user={{ totalPosts: 0 }} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders badge icons when user has badges', () => {
      render(<ParticipationBadges user={{ totalPosts: 15 }} />);
      expect(screen.getByTitle('Publicador')).toBeInTheDocument();
    });
  });

  describe('UserAvatar Rendering', () => {
    it('renders initials when no avatar is present', () => {
      render(<UserAvatar user={{ firstName: 'Maria', lastName: 'Lopez' }} />);
      const fallback = screen.getByLabelText('Avatar de Maria');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveTextContent('ML');
    });

    it('renders image when valid avatarUrl is present', () => {
      render(
        <UserAvatar
          user={{
            firstName: 'Jorge',
            lastName: 'Rios',
            avatarUrl: 'https://example.com/avatar.png',
          }}
        />,
      );
      const img = screen.getByAltText('Avatar de Jorge');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
    });

    it('falls back to initials when avatar image fails to load', () => {
      render(
        <UserAvatar
          user={{
            firstName: 'Sofia',
            lastName: 'Vargas',
            avatarUrl: 'https://example.com/broken.png',
          }}
        />,
      );
      const img = screen.getByAltText('Avatar de Sofia');
      fireEvent.error(img);

      const fallback = screen.getByLabelText('Avatar de Sofia');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveTextContent('SV');
    });

    it('applies compact size classes when size="sm"', () => {
      render(<UserAvatar user={{ firstName: 'Leo' }} size="sm" />);
      const fallback = screen.getByLabelText('Avatar de Leo');
      expect(fallback.className).toContain('h-8 w-8');
    });
  });
});
