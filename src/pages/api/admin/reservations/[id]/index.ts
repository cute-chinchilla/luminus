import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const GET: APIRoute = async (context) => {
    const id = context.params.id;
    try {
        const DB = getDB(context.locals);

        const result = await DB.prepare('SELECT * FROM reservations WHERE id = ?').bind(id).first();

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
