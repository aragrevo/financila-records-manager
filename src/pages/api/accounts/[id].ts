import type { APIRoute } from 'astro';
import { redis, KEYS } from '../../../lib/db';
import type { Account } from '../../../lib/types';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const account = await redis.hgetall<Account>(`${KEYS.ACCOUNT}:${id}`);

    if (!account || !account.id) {
      return new Response(JSON.stringify({ error: 'Account not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(account), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching account:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch account' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const existing = await redis.hgetall<Account>(`${KEYS.ACCOUNT}:${id}`);

    if (!existing || !existing.id) {
      return new Response(JSON.stringify({ error: 'Account not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const updated: Account = {
      ...existing,
      ...body,
      id,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    await redis.hset(`${KEYS.ACCOUNT}:${id}`, updated);

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating account:', error);
    return new Response(JSON.stringify({ error: 'Failed to update account' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const existing = await redis.hgetall<Account>(`${KEYS.ACCOUNT}:${id}`);

    if (!existing || !existing.id) {
      return new Response(JSON.stringify({ error: 'Account not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await redis.del(`${KEYS.ACCOUNT}:${id}`);
    await redis.srem(KEYS.ACCOUNTS_INDEX, id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete account' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
