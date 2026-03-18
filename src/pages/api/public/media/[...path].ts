import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { getR2 } from '@/lib/r2';

export const GET: APIRoute = async (context) => {
    try {
        const R2 = getR2(context.locals);
        const path = context.params.path;

        if (!path) {
            return new Response(JSON.stringify({ success: false, error: 'No path provided' }), { status: 400 });
        }

        const object = await R2.get(path);

        if (!object) {
            console.warn(`Object not found in R2: ${path}`);
            return new Response(JSON.stringify({ success: false, error: 'Object not found' }), { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

        // Ensure accurate content-type if missing
        if (!headers.has('content-type')) {
            const extension = path.split('.').pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = {
                'webp': 'image/webp',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'svg': 'image/svg+xml',
                'ico': 'image/x-icon'
            };
            if (extension && mimeTypes[extension]) {
                headers.set('content-type', mimeTypes[extension]);
            } else {
                headers.set('content-type', 'application/octet-stream');
            }
        }

        return new Response(object.body, {
            headers
        });
    } catch (error: any) {
        console.error('Media serving error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
