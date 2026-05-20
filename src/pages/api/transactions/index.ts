import type { APIRoute } from 'astro';
import { redis, KEYS } from '../../../lib/db';
import type { Transaction } from '../../../lib/types';

export const GET: APIRoute = async ({ url }) => {
  try {
    const accountId = url.searchParams.get('accountId');
    const categoryId = url.searchParams.get('categoryId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let txnIds: string[] = [];

    if (accountId) {
      txnIds = await redis.zrange(`${KEYS.TRANSACTIONS_BY_ACCOUNT}:${accountId}`, 0, -1, { rev: true });
    } else if (categoryId) {
      txnIds = await redis.zrange(`${KEYS.TRANSACTIONS_BY_CATEGORY}:${categoryId}`, 0, -1, { rev: true });
    } else {
      txnIds = await redis.zrange(`${KEYS.TRANSACTIONS_BY_DATE}:user-001`, offset, offset + limit - 1, { rev: true });
    }

    const transactions: Transaction[] = [];
    for (const id of txnIds.slice(offset, offset + limit)) {
      const txn = await redis.hgetall<Transaction>(`${KEYS.TRANSACTION}:${id}`);
      if (txn) {
        transactions.push(txn);
      }
    }

    return new Response(JSON.stringify(transactions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch transactions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const id = `txn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const date = body.date || new Date().toISOString().split('T')[0];

    const transaction: Transaction = {
      id,
      userId: 'user-001',
      createdAt: new Date().toISOString(),
      status: 'completed',
      date,
      ...body,
    };

    await redis.hset(`${KEYS.TRANSACTION}:${id}`, transaction);
    await redis.sadd(KEYS.TRANSACTIONS_INDEX, id);

    const score = new Date(date).getTime();
    await redis.zadd(`${KEYS.TRANSACTIONS_BY_ACCOUNT}:${transaction.accountId}`, { score, member: id });
    await redis.zadd(`${KEYS.TRANSACTIONS_BY_CATEGORY}:${transaction.categoryId}`, { score, member: id });
    await redis.zadd(`${KEYS.TRANSACTIONS_BY_DATE}:user-001`, { score, member: id });

    // Update account balance
    const account = await redis.hgetall<{ balance: number }>(`${KEYS.ACCOUNT}:${transaction.accountId}`);
    if (account) {
      const newBalance = account.balance + transaction.amount;
      await redis.hset(`${KEYS.ACCOUNT}:${transaction.accountId}`, {
        balance: newBalance,
        lastUpdated: date,
      });
    }

    return new Response(JSON.stringify(transaction), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new Response(JSON.stringify({ error: 'Failed to create transaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
