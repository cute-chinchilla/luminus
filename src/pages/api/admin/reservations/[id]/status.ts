import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const PATCH: APIRoute = async (context) => {
    const id = context.params.id;
    try {
        const DB = getDB(context.locals);
        const body = await context.request.json();
        const { status } = body;

        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid status' }), { status: 400 });
        }

        const result = await DB.prepare(`
      UPDATE reservations 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(status, id).first();

        if (!result) {
            return new Response(JSON.stringify({ success: false, error: 'Not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true, data: result }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};
