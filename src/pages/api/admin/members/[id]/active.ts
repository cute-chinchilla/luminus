import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const PATCH: APIRoute = async (context) => {
    try {
        const { id } = context.params;
        const DB = getDB(context.locals);
        const { is_active } = await context.request.json();

        if (is_active === undefined || (is_active !== 0 && is_active !== 1)) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid active status' }), { status: 400 });
        }

        await DB.prepare('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .bind(is_active, id)
            .run();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};
