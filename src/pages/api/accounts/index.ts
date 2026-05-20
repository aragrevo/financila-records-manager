import type { APIRoute } from 'astro';
import { accountsService } from '../../../services/accounts.service';

export const GET: APIRoute = async ({ url }) => {
  try {
    const type = url.searchParams.get('type') as any;
    const category = url.searchParams.get('category') as any;
    const status = url.searchParams.get('status') as any;

    const accounts = await accountsService.getAll({ type, category, status });

    return new Response(JSON.stringify({ data: accounts }), {
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
