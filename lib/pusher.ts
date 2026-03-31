import PusherClient from "pusher-js";

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1";
const createFallbackChannel = (name = "") => ({
    name,
    bind: () => { },
    unbind: () => { },
    unbind_all: () => { },
});

export const pusherClient = pusherKey
    ? new PusherClient(pusherKey, {
        cluster: pusherCluster,
        authEndpoint: "/api/pusher/auth",
    })
    : {
        subscribe: (name: string) => createFallbackChannel(name),
        unsubscribe: () => { },
        bind: () => { },
        unbind: () => { },
        unbind_all: () => { },
    } as any;

