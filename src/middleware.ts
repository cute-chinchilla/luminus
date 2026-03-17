import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

const isProtectedRoute = createRouteMatcher([
    '/mypage(.*)',
    '/admin(.*)',
    '/api/admin(.*)'
]);

const isAdminRoute = createRouteMatcher([
    '/admin(.*)',
    '/api/admin(.*)'
]);

export const onRequest = clerkMiddleware(async (auth, context, next) => {
    if (isProtectedRoute(context.request)) {
        const authObj = auth();
        if (!authObj.userId) {
            return authObj.redirectToSignIn();
        }

        // Check if route is admin only
        if (isAdminRoute(context.request)) {
            const DB = (context.locals as any).runtime?.env?.DB;
            if (DB) {
                try {
                    const user = await DB.prepare('SELECT role FROM users WHERE clerk_id = ?').bind(authObj.userId).first();
                    if (!user || user.role !== 'admin') {
                        // User exists but is not an admin, redirect to home
                        return context.redirect('/', 302);
                    }
                } catch (e) {
                    console.error('Error verifying admin role:', e);
                    return context.redirect('/', 302);
                }
            } else {
                // If DB is not available in local dev without wrangler, we might want to allow or block. Let's block for safety.
                console.warn('DB binding not found in middleware');
                return context.redirect('/', 302);
            }
        }
    }
    return next();
});
