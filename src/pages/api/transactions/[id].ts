import type { APIRoute } from 'astro';
import { redis, KEYS } from '../../../lib/db';
import type { Transaction } from '../../../lib/types';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const transaction = await redis.hgetall<Transaction>(`${KEYS.TRANSACTION}:${id}`);

    if (!transaction || !transaction.id) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(transaction), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const existing = await redis.hgetall<Transaction>(`${KEYS.TRANSACTION}:${id}`);

    if (!existing || !existing.id) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const updated: Transaction = {
      ...existing,
      ...body,
      id,
    };

    await redis.hset(`${KEYS.TRANSACTION}:${id}`, updated);

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return new Response(JSON.stringify({ error: 'Failed to update transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const existing = await redis.hgetall<Transaction>(`${KEYS.TRANSACTION}:${id}`);

    if (!existing || !existing.id) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await redis.del(`${KEYS.TRANSACTION}:${id}`);
    await redis.srem(KEYS.TRANSACTIONS_INDEX, id);
    await redis.zrem(`${KEYS.TRANSACTIONS_BY_ACCOUNT}:${existing.accountId}`, id);
    await redis.zrem(`${KEYS.TRANSACTIONS_BY_CATEGORY}:${existing.categoryId}`, id);
    await redis.zrem(`${KEYS.TRANSACTIONS_BY_DATE}:user-001`, id);

    // Revert account balance
    const account = await redis.hgetall<{ balance: number }>(`${KEYS.ACCOUNT}:${existing.accountId}`);
    if (account) {
      const newBalance = account.balance - existing.amount;
      await redis.hset(`${KEYS.ACCOUNT}:${existing.accountId}`, {
        balance: newBalance,
        lastUpdated: new Date().toISOString().split('T')[0],
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
