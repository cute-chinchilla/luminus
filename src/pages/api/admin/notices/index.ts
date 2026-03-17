import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const GET: APIRoute = async (context) => {
    try {
        const DB = getDB(context.locals);
        const url = new URL(context.request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const category = url.searchParams.get('category') || '';
        const search = url.searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM notices';
        let countQuery = 'SELECT COUNT(*) as total FROM notices';
        const params: any[] = [];
        const whereClauses: string[] = [];

        if (category) {
            whereClauses.push('category = ?');
            params.push(category);
        }

        if (search) {
            whereClauses.push('title LIKE ?');
            params.push(`%${search}%`);
        }

        if (whereClauses.length > 0) {
            const whereStr = ' WHERE ' + whereClauses.join(' AND ');
            query += whereStr;
            countQuery += whereStr;
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

        const totalResult = await DB.prepare(countQuery).bind(...params).first();
        const total = (totalResult as any)?.total || 0;
        const totalPages = Math.ceil(total / limit);

        const { results } = await DB.prepare(query).bind(...params, limit, offset).all();

        return new Response(JSON.stringify({
            success: true,
            data: results,
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

export const POST: APIRoute = async (context) => {
    try {
        const DB = getDB(context.locals);
        const body = await context.request.json();
        const { title, content, thumbnail_url, category, is_active } = body;

        if (!title) {
            return new Response(JSON.stringify({ success: false, error: 'Title is required' }), { status: 400 });
        }

        const result = await DB.prepare(`
            INSERT INTO notices (title, content, thumbnail_url, category, is_active)
            VALUES (?, ?, ?, ?, ?)
            RETURNING *
        `).bind(title, content || '', thumbnail_url || '', category || 'notice', is_active ? 1 : 0).first();

        return new Response(JSON.stringify({ success: true, data: result }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};
