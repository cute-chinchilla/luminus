import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const body = await request.json();
        const {
            customer_name,
            customer_phone,
            booking_date,
            booking_time,
            booking_content,
            items,
            total_price
        } = body;

        // Basic validation
        if (!customer_name || !customer_phone || !booking_date || !booking_time) {
            return new Response(JSON.stringify({
                success: false,
                error: '필수 항목이 누락되었습니다.'
            }), { status: 400 });
        }

        const DB = getDB(locals);
        const now = new Date().toISOString();

        await DB.prepare(`
      INSERT INTO reservations (
        customer_name, 
        customer_phone, 
        booking_date, 
        booking_time, 
        booking_content, 
        items_json, 
        total_price, 
        status, 
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
            customer_name,
            customer_phone,
            booking_date,
            booking_time,
            booking_content || '',
            JSON.stringify(items || []),
            total_price || 0,
            'pending',
            now,
            now
        ).run();

        return new Response(JSON.stringify({
            success: true
        }), { status: 201 });

    } catch (error: any) {
        console.error('Reservation Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: '예약 신청 중 오류가 발생했습니다.'
        }), { status: 500 });
    }
};
