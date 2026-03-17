export function getDB(locals: App.Locals): any {
    const DB = (locals as any).runtime?.env?.DB;
    if (!DB) {
        throw new Error("D1 Database binding 'DB' not found.");
    }
    return DB;
}
