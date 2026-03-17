import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const GET: APIRoute = async (context) => {
    try {
        const DB = getDB(context.locals);

        // We want to count how many promotions are in each category
        const { results } = await DB.prepare(`
      SELECT c.*, COUNT(p.id) as promotions_count 
      FROM promotion_categories c
      LEFT JOIN promotions p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.sort_order ASC
    `).all();

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
        const { name, is_active } = body;

        const maxSort = await DB.prepare('SELECT MAX(sort_order) as max FROM promotion_categories').first();
        const nextSort = ((maxSort as any)?.max ?? -1) + 1;

        const result = await DB.prepare(`
      INSERT INTO promotion_categories (name, sort_order, is_active)
      VALUES (?, ?, ?)
      RETURNING *
    `).bind(name, nextSort, is_active ? 1 : 0).first();

        return new Response(JSON.stringify({ success: true, data: { ...result, promotions_count: 0 } }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};
