export const backendBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const getStoredAccessToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const setStoredAccessToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', token);
};

export const getStoredRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

export const setStoredRefreshToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('refreshToken', token);
};

const normalizeUrl = (path: string) => {
  const base = backendBaseUrl.replace(/\/+$/, '');
  const uri = path.startsWith('/') ? path : `/${path}`;
  return `${base}${uri}`;
};

export const backendFetch = async (
  path: string,
  options: RequestInit = {},
): Promise<Response> => {
  const token = getStoredAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    Object.assign(headers, { Authorization: `Bearer ${token}` });
  }

  return fetch(normalizeUrl(path), {
    ...options,
    headers,
  });
};
