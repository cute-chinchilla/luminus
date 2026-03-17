import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const GET: APIRoute = async (context) => {
    try {
        const DB = getDB(context.locals);
        const url = new URL(context.request.url);
        const categoryId = url.searchParams.get('category_id');

        let query = `
      SELECT p.*, c.name as category_name 
      FROM promotions p
      LEFT JOIN promotion_categories c ON p.category_id = c.id
    `;
        let params: any[] = [];

        if (categoryId) {
            query += ` WHERE p.category_id = ?`;
            params.push(categoryId);
        }

        query += ` ORDER BY p.category_id ASC, p.sort_order ASC`;

        const stmt = DB.prepare(query);
        const { results } = await (params.length > 0 ? stmt.bind(...params) : stmt).all();

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
        const { category_id, name, description, price, original_price, discount_percent, badge_text, extra_note, is_active } = body;

        // Get max sort_order for this specific category
        const maxSortRow = await DB.prepare('SELECT MAX(sort_order) as max FROM promotions WHERE category_id = ?').bind(category_id).first();
        const nextSort = ((maxSortRow as any)?.max ?? -1) + 1;

        const result = await DB.prepare(`
      INSERT INTO promotions (category_id, name, description, price, original_price, discount_percent, badge_text, extra_note, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
            category_id, name, description || '', price, original_price || 0, discount_percent || 0, badge_text || '', extra_note || '', nextSort, is_active ? 1 : 0
        ).first();

        return new Response(JSON.stringify({ success: true, data: result }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};
