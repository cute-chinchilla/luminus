/// <reference path="../.astro/types.d.ts" />

type D1Database = import('@cloudflare/workers-types/experimental').D1Database;
type R2Bucket = import('@cloudflare/workers-types/experimental').R2Bucket;

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
    interface Env {
        DB: D1Database;
        R2: R2Bucket;
        CLERK_PUBLISHABLE_KEY: string;
        CLERK_SECRET_KEY: string;
        CLERK_WEBHOOK_SECRET: string;
        ADMIN_EMAILS: string;
        RESEND_API_KEY: string;
        RESEND_FROM_EMAIL: string;
        ADMIN_EMAIL: string;
    }
    interface Locals extends Runtime {
        auth(): import('@clerk/astro/server').GetAuthReturn;
        currentUser(): Promise<import('@clerk/astro/server').User | null>;
    }
}
