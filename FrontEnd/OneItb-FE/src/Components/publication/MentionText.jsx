import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

const MENTION_PATTERN = /(@[\p{L}\p{N}._-]+)/gu;

const normalizeAlias = (value) => String(value || '').trim().replace(/^@/, '').toLocaleLowerCase('es-AR');

export const MentionText = ({ text = '', users = [], className = '' }) => {
  const usersByAlias = useMemo(() => {
    const aliases = new Map();
    users.filter((user) => user?.id).forEach((user) => {
      const candidates = [
        user.firstName,
        user.username,
        user.alias,
        user.fullName?.replace(/\s+/g, ''),
      ];
      candidates.forEach((candidate) => {
        const normalized = normalizeAlias(candidate);
        if (normalized && !aliases.has(normalized)) aliases.set(normalized, user);
      });
    });
    return aliases;
  }, [users]);

  const parts = String(text).split(MENTION_PATTERN);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part.startsWith('@')) return <React.Fragment key={`${index}:${part}`}>{part}</React.Fragment>;
        const user = usersByAlias.get(normalizeAlias(part));
        if (!user) return <React.Fragment key={`${index}:${part}`}>{part}</React.Fragment>;
        return (
          <Link key={`${index}:${part}`} to={`/profile/${user.id}`} className="font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:text-cyan-300">
            {part}
          </Link>
        );
      })}
    </span>
  );
};
