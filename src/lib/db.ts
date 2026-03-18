// @ts-ignore
import { env } from 'cloudflare:workers';

export function getDB(locals?: any): any {
    try {
        const DB = (env as any).DB;

        if (!DB) {
            console.error(`D1 Binding 'DB' not found in cloudflare:workers env.`);
            throw new Error(`D1 Database binding 'DB' not found.`);
        }
        return DB;
    } catch (e: any) {
        console.error('Error in getDB:', e);
        throw e;
    }
}
