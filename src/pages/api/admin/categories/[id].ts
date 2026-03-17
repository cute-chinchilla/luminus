import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const PUT: APIRoute = async (context) => {
    const id = context.params.id;
    try {
        const DB = getDB(context.locals);
        const body = await context.request.json();
        const { name, is_active } = body;

        const result = await DB.prepare(`
      UPDATE promotion_categories 
      SET name = ?, is_active = ?
      WHERE id = ?
      RETURNING *
    `).bind(name, is_active ? 1 : 0, id).first();

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

        // Check if any promotions are linked to this category
        const { count } = await DB.prepare('SELECT COUNT(*) as count FROM promotions WHERE category_id = ?').bind(id).first() as { count: number };

        if (count > 0) {
            return new Response(JSON.stringify({ success: false, error: `소속된 프로모션이 ${count}개 존재하여 삭제할 수 없습니다. 먼저 소속 프로모션을 삭제하거나 다른 카테고리로 이동해주세요.` }), { status: 400 });
        }

        const result = await DB.prepare('DELETE FROM promotion_categories WHERE id = ? RETURNING id').bind(id).first();

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
