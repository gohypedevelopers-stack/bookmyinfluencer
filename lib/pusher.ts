import PusherClient from "pusher-js";

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1";

export const pusherClient = pusherKey
    ? new PusherClient(pusherKey, {
        cluster: pusherCluster,
        authEndpoint: "/api/pusher/auth",
    })
    : {
        subscribe: () => ({ bind: () => { }, unbind: () => { } }),
        unsubscribe: () => { },
        bind: () => { },
        unbind: () => { },
    } as any;

