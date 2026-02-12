
import { db } from "@/lib/db";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const users = await db.user.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });

    const serializedUsers = users.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastSeenAt: user.lastSeenAt ? user.lastSeenAt.toISOString() : null
    }));

    return (
        <UsersClient initialUsers={serializedUsers} />
    );
}
