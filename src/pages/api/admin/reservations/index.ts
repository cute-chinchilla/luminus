import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const GET: APIRoute = async (context) => {
    try {
        const DB = getDB(context.locals);
        const url = new URL(context.request.url);

        // filters
        const status = url.searchParams.get('status');
        const dateFrom = url.searchParams.get('date_from');
        const dateTo = url.searchParams.get('date_to');
        const search = url.searchParams.get('search');

        // pagination
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        let queryBase = 'FROM reservations WHERE 1=1';
        let params: any[] = [];

        if (status && status !== '전체') {
            queryBase += ' AND status = ?';
            params.push(status);
        }
        if (dateFrom) {
            queryBase += ' AND booking_date >= ?';
            params.push(dateFrom);
        }
        if (dateTo) {
            queryBase += ' AND booking_date <= ?';
            params.push(dateTo);
        }
        if (search) {
            queryBase += ' AND (customer_name LIKE ? OR customer_phone LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Get Total Count
        const countSql = `SELECT COUNT(*) as total ${queryBase}`;
        const countStmt = params.length > 0 ? DB.prepare(countSql).bind(...params) : DB.prepare(countSql);
        const { total } = await countStmt.first() as { total: number };

        // Get Rows
        const dataSql = `SELECT * ${queryBase} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        const dataParams = [...params, limit, offset];
        const dataStmt = DB.prepare(dataSql).bind(...dataParams);
        const { results } = await dataStmt.all();

        const totalPages = Math.ceil(total / limit);

        return new Response(JSON.stringify({
            success: true,
            data: results,
            pagination: { total, page, limit, totalPages }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};
