import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
    const { request, locals } = context;

    try {
        const payload = await request.json();
        const type = payload.type;
        const data = payload.data;

        const DB = (locals as any).runtime?.env?.DB;
        if (!DB) {
            console.error('Database binding (DB) not found in runtime.env');
            return new Response('Database not configured', { status: 500 });
        }

        if (type === 'user.created') {
            const clerkId = data.id;
            const adminEmails = ((locals as any).runtime?.env?.ADMIN_EMAILS || '').split(',').map((e: string) => e.trim());
            const email = data.email_addresses?.[0]?.email_address || '';

            const role = adminEmails.includes(email) ? 'admin' : 'user';

            // Insert new user into D1 Database
            await DB.prepare(`
        INSERT INTO users (clerk_id, role, agreed_terms, agreed_privacy, is_active)
        VALUES (?, ?, 1, 1, 1)
      `).bind(clerkId, role).run();

        } else if (type === 'user.deleted') {
            const clerkId = data.id;
            // Delete user from D1 Database
            await DB.prepare(`DELETE FROM users WHERE clerk_id = ?`).bind(clerkId).run();
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Clerk Webhook Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
