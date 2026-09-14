export type Role = 'USER' | 'VOLUNTEER' | 'RELIEF_ORG' | 'ADMIN';

export const normalizeRole = (role?: string | null): Role => {
  if (!role) return 'USER';

  const clean = role.trim().toUpperCase().replace(/-/g, '_');

  if (
    clean === 'RELIEF_ORG' ||
    clean === 'RELIEF' ||
    clean === 'RELIEF_ORGANIZATION'
  ) {
    return 'RELIEF_ORG';
  }

  if (clean === 'VOLUNTEER') return 'VOLUNTEER';
  if (clean === 'ADMIN') return 'ADMIN';

  return 'USER';
};
