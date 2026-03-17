import type { APIRoute } from 'astro';
import { getR2, generateId } from '@/lib/r2';

export const POST: APIRoute = async (context) => {
    try {
        const R2 = getR2(context.locals);
        const request = context.request;
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'common';

        if (!file || !(file instanceof File)) {
            return new Response(JSON.stringify({ success: false, error: 'No file uploaded' }), { status: 400 });
        }

        // Generate unique key
        const extension = file.name.split('.').pop()?.toLowerCase() || 'webp';
        const filename = `${generateId()}-${Date.now()}.${extension}`;
        const key = `${folder}/${filename}`;

        // Upload to R2
        const arrayBuffer = await file.arrayBuffer();
        await R2.put(key, arrayBuffer, {
            httpMetadata: {
                contentType: file.type || 'image/webp'
            }
        });

        // In local dev/Pages, the URL might need to be resolved via a custom domain.
        // For now we assume a public r2.dev domain or custom domain available via env.
        const publicDomain = (context.locals as any).runtime?.env?.R2_PUBLIC_DOMAIN;
        const url = publicDomain ? `https://${publicDomain}/${key}` : `/${key}`; // Fallback to relative if not configured, though won't work perfectly in prod without proxy

        // Workaround for dev environment
        const isDev = import.meta.env.DEV;
        const finalUrl = isDev ? `http://localhost:4321/api/admin/media/${key}` : (publicDomain ? `https://${publicDomain}/${key}` : `/${key}`);


        return new Response(JSON.stringify({
            success: true,
            url: finalUrl,
            key: key
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Upload Error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
};

export const DELETE: APIRoute = async (context) => {
    try {
        const R2 = getR2(context.locals);
        const body = await context.request.json();
        const { key } = body;

        if (!key) {
            return new Response(JSON.stringify({ success: false, error: 'No key provided' }), { status: 400 });
        }

        await R2.delete(key);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Delete Upload Error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}
