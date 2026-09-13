import { isAxiosError } from 'axios';

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!isAxiosError(error)) return fallback;

  const message = error.response?.data?.message;

  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string') return message;

  return fallback;
};
