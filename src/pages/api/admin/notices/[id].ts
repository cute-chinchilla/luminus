import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const PUT: APIRoute = async (context) => {
    try {
        const { id } = context.params;
        const DB = getDB(context.locals);
        const body = await context.request.json();
        const { title, content, thumbnail_url, category, is_active } = body;

        if (!title) {
            return new Response(JSON.stringify({ success: false, error: 'Title is required' }), { status: 400 });
        }

        await DB.prepare(`
            UPDATE notices 
            SET title = ?, content = ?, thumbnail_url = ?, category = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(title, content || '', thumbnail_url || '', category || 'notice', is_active ? 1 : 0, id).run();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};

export const DELETE: APIRoute = async (context) => {
    try {
        const { id } = context.params;
        const DB = getDB(context.locals);

        // Optionally get thumbnail_url to delete from R2 (handled by client before calling this or we could do it here)
        // For simplicity, we assume R2 deletion is handled if needed or done separately.

        await DB.prepare('DELETE FROM notices WHERE id = ?').bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};
