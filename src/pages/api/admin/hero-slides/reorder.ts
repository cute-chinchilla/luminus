import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const PATCH: APIRoute = async (context) => {
    try {
        const DB = getDB(context.locals);
        const body = await context.request.json();
        const { items } = body as { items: { id: number, sort_order: number }[] };

        if (!items || !Array.isArray(items)) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid payload' }), { status: 400 });
        }

        // D1 doesn't support bulk UPDATE well (no CASE WHEN with multiple bindings easily without dynamic query building). 
        // We will do parallel prepared statements.
        const statements = items.map(item =>
            DB.prepare('UPDATE hero_slides SET sort_order = ? WHERE id = ?').bind(item.sort_order, item.id)
        );

        if (statements.length > 0) {
            await DB.batch(statements);
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};
