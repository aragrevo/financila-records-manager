import { defineMiddleware } from 'astro:middleware';
import { validateSession } from './lib/auth';

const PUBLIC_PATHS = ['/login', '/api/auth/login'];

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  if (PUBLIC_PATHS.includes(pathname)) {
    return next();
  }

  const cookieHeader = context.request.headers.get('cookie');
  if (!validateSession(cookieHeader)) {
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/login');
  }

  return next();
});
