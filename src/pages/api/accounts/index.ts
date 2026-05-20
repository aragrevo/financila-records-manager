import type { APIRoute } from 'astro';
import { redis, KEYS } from '../../../lib/db';
import type { Account } from '../../../lib/types';

export const GET: APIRoute = async () => {
  try {
    const accountIds = await redis.smembers(KEYS.ACCOUNTS_INDEX);
    const accounts: Account[] = [];

    for (const id of accountIds) {
      const account = await redis.hgetall<Account>(`${KEYS.ACCOUNT}:${id}`);
      if (account) {
        accounts.push(account);
      }
    }

    return new Response(JSON.stringify(accounts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch accounts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const id = `acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const account: Account = {
      id,
      userId: 'user-001',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString().split('T')[0],
      currency: 'USD',
      status: 'active',
      ...body,
    };

    await redis.hset(`${KEYS.ACCOUNT}:${id}`, account);
    await redis.sadd(KEYS.ACCOUNTS_INDEX, id);

    return new Response(JSON.stringify(account), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating account:', error);
    return new Response(JSON.stringify({ error: 'Failed to create account' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
