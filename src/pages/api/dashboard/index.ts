import type { APIRoute } from 'astro';
import { dashboardService } from '../../../services/dashboard.service';

export const GET: APIRoute = async () => {
  try {
    const dashboard = await dashboardService.getFullDashboard();

    return new Response(JSON.stringify({ data: dashboard }), {
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
