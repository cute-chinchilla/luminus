import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const PATCH: APIRoute = async (context) => {
    const id = context.params.id;
    try {
        const DB = getDB(context.locals);
        const body = await context.request.json();
        const { memo } = body;

        const result = await DB.prepare(`
      UPDATE reservations 
      SET memo = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(memo || '', id).first();

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
