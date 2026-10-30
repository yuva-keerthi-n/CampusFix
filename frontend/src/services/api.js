import axios from 'axios';

export const TOKEN_KEY = 'campusfix_token';
export const USER_KEY = 'campusfix_user';

// All requests go to /api (proxied to the Express server by Vite in development).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});
// Attach the JWT to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is missing/expired, clear the session and send the user to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Turns any axios error into a message that is safe to show to the user.
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.request && !error?.response) {
    return 'Cannot reach the server. Check that the backend is running on port 5000.';
  }
  return fallback;
}

export default api;
