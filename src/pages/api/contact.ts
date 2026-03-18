import type { APIRoute } from 'astro';
import { sendContactEmail } from '@/lib/email';
import { env } from 'cloudflare:workers';

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

        const cloudflareEnv = env || (locals as any).runtime?.env || process.env;

        const { error } = await sendContactEmail(cloudflareEnv, { name, phone, message });

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
