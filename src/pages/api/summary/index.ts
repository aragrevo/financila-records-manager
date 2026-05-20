import type { APIRoute } from 'astro';
import { summaryService } from '../../../services/summary.service';

export const GET: APIRoute = async () => {
  try {
    const summary = await summaryService.getSummary();

    return new Response(JSON.stringify({ data: summary }), {
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
