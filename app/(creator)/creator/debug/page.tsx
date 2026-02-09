import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export default async function DebugPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return <div>Not logged in</div>;
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } });

    let threads: any[] = [];
    let allThreads: any[] = [];

    if (user) {
        threads = await db.chatThread.findMany({
            where: { participants: { contains: user.id } }
        });

        // Also fetch ALL threads to see if we can find any pattern
        allThreads = await db.chatThread.findMany({
            take: 10,
            orderBy: { updatedAt: 'desc' }
        });
    }

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Debug Info</h1>

            <div className="mb-8">
                <h2 className="font-bold bg-gray-100 p-2">Current Session</h2>
                <pre className="whitespace-pre-wrap">{JSON.stringify(session, null, 2)}</pre>
            </div>

            <div className="mb-8">
                <h2 className="font-bold bg-gray-100 p-2">Database User (Resolving via Email)</h2>
                <pre className="whitespace-pre-wrap">{JSON.stringify(user, null, 2)}</pre>
            </div>

            <div className="mb-8">
                <h2 className="font-bold bg-gray-100 p-2">My Threads (participants contains user.id)</h2>
                <pre className="whitespace-pre-wrap">{JSON.stringify(threads, null, 2)}</pre>
            </div>

            <div className="mb-8">
                <h2 className="font-bold bg-gray-100 p-2">All Recent Threads (Sample 10)</h2>
                <pre className="whitespace-pre-wrap">{JSON.stringify(allThreads, null, 2)}</pre>
            </div>
        </div>
    );
}
