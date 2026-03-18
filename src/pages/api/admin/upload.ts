import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { getR2, generateId } from '@/lib/r2';

export const POST: APIRoute = async (context) => {
    try {
        const R2 = getR2(context.locals);
        const request = context.request;
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = (formData.get('folder') || 'common').toString();

        if (!file || !(file instanceof File)) {
            return new Response(JSON.stringify({ success: false, error: 'No file uploaded' }), { status: 400 });
        }

        // Generate unique key
        const extension = file.name.split('.').pop()?.toLowerCase() || 'webp';
        const filename = `${generateId()}-${Date.now()}.${extension}`;
        const key = `${folder}/${filename}`;

        console.log(`Uploading file to R2: ${key}, type: ${file.type}`);

        // Upload to R2
        const arrayBuffer = await file.arrayBuffer();
        await R2.put(key, arrayBuffer, {
            httpMetadata: {
                contentType: file.type || 'image/webp'
            }
        });

        // Resolve public URL
        const publicDomain = (env as any).R2_PUBLIC_DOMAIN;
        const publicPath = `/api/public/media/${key}`;

        // If publicDomain is set, we still need prefix if it points to this app,
        // but if it's a dedicated R2 custom domain, it wouldn't.
        // For simplicity and safety, we favor the prefix route unless it's a different domain.
        let finalUrl = publicPath;
        if (publicDomain && !publicDomain.includes('workers.dev')) {
            // Dedicated custom domain (e.g. media.example.com)
            finalUrl = `https://${publicDomain}/${key}`;
        } else if (import.meta.env.DEV) {
            finalUrl = `http://localhost:4321${publicPath}`;
        } else if (publicDomain && publicDomain.includes('workers.dev')) {
            // It's the same workers.dev domain, must include prefix
            finalUrl = `https://${publicDomain}${publicPath}`;
        }

        console.log(`File uploaded successfully. URL: ${finalUrl}`);

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
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
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
