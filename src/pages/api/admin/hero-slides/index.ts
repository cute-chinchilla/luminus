import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const GET: APIRoute = async (context) => {
    try {
        const DB = getDB(context.locals);
        const { results } = await DB.prepare('SELECT * FROM hero_slides ORDER BY sort_order ASC').all();

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
        const { image_url, subtitle, title, description, is_active } = body;

        // Get max sort_order
        const maxSort = await DB.prepare('SELECT MAX(sort_order) as max FROM hero_slides').first();
        const nextSort = ((maxSort as any)?.max ?? -1) + 1;

        const result = await DB.prepare(`
      INSERT INTO hero_slides (image_url, subtitle, title, description, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(image_url, subtitle, title, description, nextSort, is_active ? 1 : 0).first();

        return new Response(JSON.stringify({ success: true, data: result }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};
