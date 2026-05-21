import type { APIRoute } from 'astro';
import { createSessionCookie } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const expected = import.meta.env?.AUTH_PASSWORD ?? process.env.AUTH_PASSWORD;
    if (!expected) {
      console.error('AUTH_PASSWORD env var is not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password !== expected) {
      return new Response(
        JSON.stringify({ error: 'Invalid password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cookie = createSessionCookie();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
