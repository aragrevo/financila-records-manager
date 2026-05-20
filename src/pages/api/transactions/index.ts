import type { APIRoute } from 'astro';
import { transactionsService } from '../../../services/transactions.service';

export const GET: APIRoute = async ({ url }) => {
  try {
    const type = url.searchParams.get('type') as any;
    const category = url.searchParams.get('category') || undefined;
    const account = url.searchParams.get('account') || undefined;
    const status = url.searchParams.get('status') as any;
    const startDate = url.searchParams.get('startDate') || undefined;
    const endDate = url.searchParams.get('endDate') || undefined;
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
    const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined;

    const transactions = await transactionsService.getAll({
      type,
      category,
      account,
      status,
      startDate,
      endDate,
      limit,
      offset,
    });

    return new Response(JSON.stringify({ data: transactions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
