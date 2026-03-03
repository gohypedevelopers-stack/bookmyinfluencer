import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";

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
        const notification = await db.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link
            }
        });

        // Push real-time event via Pusher so connected clients update instantly
        try {
            await pusherServer.trigger(`user-${userId}`, 'notification:new', {
                notification: {
                    id: notification.id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    link: notification.link,
                    createdAt: notification.createdAt,
                    read: false,
                }
            });
        } catch (pusherErr) {
            // Don't fail if Pusher is unavailable
            console.warn("Pusher trigger failed:", pusherErr);
        }
    } catch (e) {
        console.error("Notification Error", e);
    }
}
