import { PrismaClient } from "@prisma/client"

const protectedModels = [
    'User',
    'InfluencerProfile',
    'BrandProfile',
    'Creator',
    'KYCSubmission',
    'CreatorKYCSubmission',
    'Campaign',
    'Contract',
    'EscrowTransaction'
];

const prismaClientSingleton = () => {
    const client = new PrismaClient();

    return client.$extends({
        query: {
            $allModels: {
                async delete({ model, args, query }) {
                    if (process.env.NODE_ENV === 'production' && protectedModels.includes(model)) {
                        const msg = `[CRITICAL_DATA_GUARD] BLOCKED DELETE ON ${model} IN PRODUCTION`;
                        console.error(msg);
                        // Optionally create an audit log entry via a separate raw query or just log to stdout
                        throw new Error(msg);
                    }
                    return query(args);
                },
                async deleteMany({ model, args, query }) {
                    if (process.env.NODE_ENV === 'production' && protectedModels.includes(model)) {
                        const msg = `[CRITICAL_DATA_GUARD] BLOCKED DELETEMANY ON ${model} IN PRODUCTION`;
                        console.error(msg);
                        throw new Error(msg);
                    }
                    return query(args);
                },
                async upsert({ model, args, query }) {
                    // Prevent empty updates on upsert?
                    // This is harder to genericize, but we can log
                    return query(args);
                }
            }
        }
    });
}

export type ExtendedPrismaClient = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: ExtendedPrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db
}
