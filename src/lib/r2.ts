// @ts-ignore
import { env } from 'cloudflare:workers';

export function getR2(locals?: any): any {
    try {
        const R2 = (env as any).R2;

        if (!R2) {
            console.error(`R2 Bucket binding 'R2' not found in cloudflare:workers env.`);
            throw new Error(`R2 Bucket binding 'R2' not found.`);
        }
        return R2;
    } catch (e: any) {
        console.error('Error in getR2:', e);
        throw e;
    }
}

// Generate a unique 16-character string for file names
export function generateId(): string {
    return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}
