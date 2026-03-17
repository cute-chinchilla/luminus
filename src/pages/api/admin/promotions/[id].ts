import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const PUT: APIRoute = async (context) => {
    const id = context.params.id;
    try {
        const DB = getDB(context.locals);
        const body = await context.request.json();
        const { category_id, name, description, price, original_price, discount_percent, badge_text, extra_note, is_active } = body;

        const result = await DB.prepare(`
      UPDATE promotions 
      SET category_id = ?, name = ?, description = ?, price = ?, original_price = ?, discount_percent = ?, badge_text = ?, extra_note = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(category_id, name, description || '', price, original_price || 0, discount_percent || 0, badge_text || '', extra_note || '', is_active ? 1 : 0, id).first();

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

        const result = await DB.prepare('DELETE FROM promotions WHERE id = ? RETURNING id').bind(id).first();

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
