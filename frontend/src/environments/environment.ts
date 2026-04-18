// Default environment (development) – points to Django running locally or in Docker
export const environment = {
  production: false,
  // In Docker, nginx or the Angular dev server proxies requests to the backend service.
  // For local dev outside Docker, change this to http://localhost:8000
  apiUrl: '/api',
};
