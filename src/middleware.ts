import { defineMiddleware } from 'astro:middleware';

// Basic Auth for preview environments.
// Enabled only when PREVIEW_AUTH_PASSWORD is set.
// Same pattern as Clerk: variable present → active, absent → skipped.

const user = import.meta.env.PREVIEW_AUTH_USER || 'preview';
const password = import.meta.env.PREVIEW_AUTH_PASSWORD;

export const onRequest = defineMiddleware((context, next) => {
  // Skip if Basic Auth is not configured (production)
  if (!password) {
    return next();
  }

  // Always allow /health for Docker HEALTHCHECK
  if (context.url.pathname === '/health') {
    return next();
  }

  const authHeader = context.request.headers.get('Authorization');

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded);
      const [reqUser, reqPass] = decoded.split(':');
      if (reqUser === user && reqPass === password) {
        return next();
      }
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Preview"',
    },
  });
});
