
import { db } from "@/lib/db";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const users = await db.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            passwordHash: true,
            createdAt: true,
            updatedAt: true,
            lastSeenAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 200
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
