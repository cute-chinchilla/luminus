import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import { createClerkClient } from '@clerk/astro/server';

export const GET: APIRoute = async (context) => {
    try {
        const DB = getDB(context.locals);
        const url = new URL(context.request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const search = url.searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM users';
        let countQuery = 'SELECT COUNT(*) as total FROM users';
        const params: any[] = [];

        if (search) {
            query += ' WHERE clerk_id LIKE ?';
            countQuery += ' WHERE clerk_id LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

        const totalResult = await DB.prepare(countQuery).bind(...params).first();
        const total = (totalResult as any)?.total || 0;
        const totalPages = Math.ceil(total / limit);

        const { results: d1Users } = await DB.prepare(query).bind(...params, limit, offset).all();

        // Integrate with Clerk data
        const secretKey = (env as any).CLERK_SECRET_KEY || import.meta.env.CLERK_SECRET_KEY;
        const publishableKey = (env as any).PUBLIC_CLERK_PUBLISHABLE_KEY || import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

        let integratedUsers = d1Users;

        if (secretKey && d1Users.length > 0) {
            try {
                const clerk = createClerkClient({ secretKey, publishableKey });
                const clerkIds = d1Users.map((u: any) => u.clerk_id);

                // Fetch users from Clerk in batch
                const clerkUsers = await clerk.users.getUserList({
                    userId: clerkIds,
                });

                // Create a map for quick lookup
                const clerkMap = new Map(clerkUsers.data.map(u => [u.id, u]));

                integratedUsers = d1Users.map((u: any) => {
                    const clerkUser = clerkMap.get(u.clerk_id);
                    return {
                        ...u,
                        email: clerkUser?.emailAddresses?.[0]?.emailAddress || '',
                        name: `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim() || 'Unknown',
                        imageUrl: clerkUser?.imageUrl || '',
                    };
                });
            } catch (clerkError) {
                console.error('Error fetching Clerk users:', clerkError);
                // Fallback to D1 data only if Clerk fails
            }
        }

        return new Response(JSON.stringify({
            success: true,
            data: integratedUsers,
            pagination: {
                total,
                page,
                limit,
                totalPages
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};
