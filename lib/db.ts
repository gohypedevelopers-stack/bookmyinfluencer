import { Prisma, PrismaClient } from "@prisma/client"

const protectedModels = [
    "User",
    "InfluencerProfile",
    "BrandProfile",
    "Creator",
    "KYCSubmission",
    "CreatorKYCSubmission",
    "Campaign",
    "Contract",
    "EscrowTransaction",
]

const RETRYABLE_DB_ERROR_PATTERNS = [
    /can't reach database server/i,
    /error in postgresql connection/i,
    /server has closed the connection/i,
    /connection terminated unexpectedly/i,
    /kind:\s*closed/i,
    /timed out fetching a new connection/i,
    /socket hang up/i,
    /forcibly closed by the remote host/i,
    /connection reset/i,
    /econnreset/i,
    /too many connections/i,
    /prepared statement .* does not exist/i,
]

const RETRYABLE_DB_ERROR_CODES = new Set([
    "P1001", // Can't reach database server
    "P1002", // Database server timed out
    "P1017", // Server has closed the connection
    "P1008", // Operations timed out
])

const MAX_DB_RETRY_ATTEMPTS = 3

export const DEFAULT_TX_OPTIONS = {
    maxWait: 10000, // 10s wait for connection
    timeout: 20000, // 20s execution time
}


function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableDbError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return RETRYABLE_DB_ERROR_CODES.has(error.code)
    }

    if (
        error instanceof Prisma.PrismaClientInitializationError ||
        error instanceof Prisma.PrismaClientRustPanicError ||
        error instanceof Prisma.PrismaClientUnknownRequestError
    ) {
        return true
    }

    const message = error instanceof Error ? error.message : String(error)
    return RETRYABLE_DB_ERROR_PATTERNS.some((pattern) => pattern.test(message))
}

const prismaClientSingleton = () => {
    const client = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    })

    return client.$extends({
        query: {
            $allModels: {
                async $allOperations({ model, operation, args, query }) {
                    if (
                        process.env.NODE_ENV === "production" &&
                        (operation === "delete" || operation === "deleteMany") &&
                        typeof model === "string" &&
                        protectedModels.includes(model)
                    ) {
                        const msg = `[CRITICAL_DATA_GUARD] BLOCKED ${operation.toUpperCase()} ON ${model} IN PRODUCTION`
                        console.error(msg)
                        throw new Error(msg)
                    }

                    for (let attempt = 1; attempt <= MAX_DB_RETRY_ATTEMPTS; attempt++) {
                        try {
                            return await query(args)
                        } catch (error) {
                            if (!isRetryableDbError(error) || attempt === MAX_DB_RETRY_ATTEMPTS) {
                                throw error
                            }

                            const delayMs = 400 * attempt
                            console.warn("[DB] Retrying query after transient failure", {
                                model,
                                operation,
                                attempt,
                                delayMs,
                                message: error instanceof Error ? error.message : String(error),
                            })
                            await sleep(delayMs)
                        }
                    }

                    throw new Error("Unreachable retry state")
                },
            },
        },
    })
}

export type ExtendedPrismaClient = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma_new: ExtendedPrismaClient | undefined
}

export const db = globalForPrisma.prisma_new ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma_new = db
}
