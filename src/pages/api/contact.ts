import type { APIRoute } from 'astro';
import { sendContactEmail } from '@/lib/email';

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const body = await request.json();
        const { name, phone, message } = body;

        if (!name || !phone || !message) {
            return new Response(JSON.stringify({
                success: false,
                error: '필수 항목이 누락되었습니다.'
            }), { status: 400 });
        }

        // @ts-ignore - runtime.env is added by Cloudflare adapter
        const env = locals.runtime?.env || process.env;

        const { error } = await sendContactEmail(env, { name, phone, message });

        if (error) {
            console.error('Resend Error:', error);
            return new Response(JSON.stringify({
                success: false,
                error: '메일 발송 중 오류가 발생했습니다.'
            }), { status: 500 });
        }

        return new Response(JSON.stringify({
            success: true
        }), { status: 200 });

    } catch (error: any) {
        console.error('Contact API Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: '문의 접수 중 오류가 발생했습니다.'
        }), { status: 500 });
    }
};
