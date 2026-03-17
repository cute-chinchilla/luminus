import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const PUT: APIRoute = async (context) => {
    const id = context.params.id;
    try {
        const DB = getDB(context.locals);
        const body = await context.request.json();
        const { name, title, image_url, specialty, credentials, is_active } = body;

        const credString = Array.isArray(credentials) ? JSON.stringify(credentials) : (typeof credentials === 'string' ? credentials : '[]');

        const result = await DB.prepare(`
      UPDATE doctors 
      SET name = ?, title = ?, image_url = ?, specialty = ?, credentials = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(name, title, image_url, specialty, credString, is_active ? 1 : 0, id).first();

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

export const DELETE: APIRoute = async (context) => {
    const id = context.params.id;
    try {
        const DB = getDB(context.locals);

        const result = await DB.prepare('DELETE FROM doctors WHERE id = ? RETURNING id').bind(id).first();

        if (!result) {
            return new Response(JSON.stringify({ success: false, error: 'Not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};
