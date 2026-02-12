import PusherServer from "pusher";

const isPusherConfigured =
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.PUSHER_APP_ID !== "app_id" &&
    process.env.PUSHER_KEY !== "key" &&
    process.env.PUSHER_SECRET !== "secret";

// Export a singleton instance of the Pusher server
export const pusherServer = isPusherConfigured
    ? new PusherServer({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.PUSHER_CLUSTER || "mt1",
        useTLS: true,
    })
    : {
        trigger: async () => {
            console.warn("Pusher is not configured. Trigger skipped.");
            return {};
        },
        authenticate: () => ({ auth: "" }),
        webhook: () => ({ isValid: () => false }),
    } as unknown as PusherServer;
