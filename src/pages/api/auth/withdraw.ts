import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async (context) => {
    const { request, locals } = context;
    const user = await locals.currentUser();

    if (!user) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const clerkId = user.id;

        // 1. Delete user from D1
        const DB = (env as any).DB || (context.locals as any).DB;
        if (DB) {
            await DB.prepare('DELETE FROM users WHERE clerk_id = ?').bind(clerkId).run();
        }

        // 2. Delete user from Clerk
        // Using simple fetch to Clerk API since @clerk/backend might not be fully configured for Cloudflare Workers Environment variables automatically.
        const secretKey = (env as any).CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY;

        if (secretKey) {
            const resp = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${secretKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!resp.ok) {
                throw new Error('Failed to delete user from Clerk');
            }
        }

        // Redirect or return success
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Withdraw Error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
