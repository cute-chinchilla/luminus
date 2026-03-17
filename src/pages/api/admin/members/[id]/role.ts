import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const PATCH: APIRoute = async (context) => {
    try {
        const { id } = context.params;
        const DB = getDB(context.locals);
        const { role } = await context.request.json();

        if (!role || (role !== 'admin' && role !== 'user')) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid role' }), { status: 400 });
        }

        // Prevent self-role-demotion (optional safety check)
        // const authObj = (context.locals as any).auth?.();
        // if (authObj?.userId) {
        //     const currentUser = await DB.prepare('SELECT clerk_id FROM users WHERE id = ?').bind(id).first();
        //     if (currentUser?.clerk_id === authObj.userId && role !== 'admin') {
        //         return new Response(JSON.stringify({ success: false, error: 'You cannot remove your own admin role' }), { status: 403 });
        //     }
        // }

        await DB.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .bind(role, id)
            .run();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};
