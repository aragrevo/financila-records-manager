import type { APIRoute } from 'astro';
import { destroySessionCookie } from '../../../lib/auth';

export const POST: APIRoute = () => {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': destroySessionCookie(),
    },
  });
};
