export function getR2(locals: App.Locals): any {
    const R2 = (locals as any).runtime?.env?.R2;
    if (!R2) {
        throw new Error("R2 Bucket binding 'R2' not found.");
    }
    return R2;
}

// Generate a unique 16-character string for file names
export function generateId(): string {
    return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}
