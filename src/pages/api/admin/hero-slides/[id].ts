import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const PUT: APIRoute = async (context) => {
    const id = context.params.id;
    try {
        const DB = getDB(context.locals);
        const body = await context.request.json();
        const { image_url, subtitle, title, description, is_active } = body;

        const result = await DB.prepare(`
      UPDATE hero_slides 
      SET image_url = ?, subtitle = ?, title = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(image_url, subtitle, title, description, is_active ? 1 : 0, id).first();

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

        // R2 Image deletion should ideally happen here or client side before calling this.
        // For simplicity, we just delete the db record. In production, we should fetch image_url and delete from R2 first.

        const result = await DB.prepare('DELETE FROM hero_slides WHERE id = ? RETURNING id').bind(id).first();

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
