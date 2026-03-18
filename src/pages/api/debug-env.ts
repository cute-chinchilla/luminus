import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const GET: APIRoute = async (context) => {
    const locals = context.locals as any;
    const info: any = {
        hasRuntime: !!locals.runtime,
        runtimeKeys: locals.runtime ? Object.keys(locals.runtime) : [],
        hasEnv: locals.runtime && !!locals.runtime.env,
        envKeys: (locals.runtime && locals.runtime.env) ? Object.keys(locals.runtime.env) : [],
        localsKeys: Object.keys(locals)
    };

    try {
        const DB = getDB(locals);
        info.hasDB = !!DB;
    } catch (e: any) {
        info.dbError = e.message;
    }

    return new Response(JSON.stringify(info), {
        headers: { 'Content-Type': 'application/json' }
    });
};
