import { db } from "@/lib/db";

export async function createAuditLog(
    action: string,
    entity: string,
    entityId: string,
    userId?: string,
    details?: any
) {
    try {
        await db.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                userId,
                details: details ? JSON.stringify(details) : null
            }
        });
    } catch (e) {
        console.error("Audit Log Error", e);
    }
}

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    link?: string
) {
    try {
        await db.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link
            }
        });
    } catch (e) {
        console.error("Notification Error", e);
    }
}
