import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const GET: APIRoute = async (context) => {
    try {
        const DB = getDB(context.locals);
        const { results } = await DB.prepare('SELECT * FROM doctors ORDER BY sort_order ASC').all();

        return new Response(JSON.stringify({ success: true, data: results }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};

export const POST: APIRoute = async (context) => {
    try {
        const DB = getDB(context.locals);
        const body = await context.request.json();
        const { name, title, image_url, specialty, credentials, is_active } = body;

        // Get max sort_order
        const maxSort = await DB.prepare('SELECT MAX(sort_order) as max FROM doctors').first();
        const nextSort = ((maxSort as any)?.max ?? -1) + 1;

        // credentials should be stringified JSON
        const credString = Array.isArray(credentials) ? JSON.stringify(credentials) : (typeof credentials === 'string' ? credentials : '[]');

        const result = await DB.prepare(`
      INSERT INTO doctors (name, title, image_url, specialty, credentials, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(name, title, image_url, specialty, credString, nextSort, is_active ? 1 : 0).first();

        return new Response(JSON.stringify({ success: true, data: result }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};
