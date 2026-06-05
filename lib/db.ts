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

const TRANSIENT_PRISMA_EVENT_PATTERNS = [
    /can't reach database server/i,
    /timed out fetching a new connection/i,
    /error in postgresql connection/i,
    /server has closed the connection/i,
    /connection terminated unexpectedly/i,
    /socket hang up/i,
    /forcibly closed by the remote host/i,
    /connection reset/i,
    /econnreset/i,
    /connection closed/i,
    /kind:\s*closed/i,
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

function isRetryableDbErrorMessage(message: string) {
    return RETRYABLE_DB_ERROR_PATTERNS.some((pattern) => pattern.test(message))
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
    return isRetryableDbErrorMessage(message)
}

function isTransientPrismaEventMessage(message: string) {
    return TRANSIENT_PRISMA_EVENT_PATTERNS.some((pattern) => pattern.test(message))
}

function maskConnectionUrl(rawUrl?: string) {
    if (!rawUrl) return "NOT DEFINED"

    try {
        const url = new URL(rawUrl)
        if (url.password) url.password = "***"
        if (url.username) url.username = "***"
        return url.toString()
    } catch {
        return "INVALID_URL"
    }
}

function withPrismaConnectionDefaults(rawUrl?: string) {
    if (!rawUrl) return rawUrl

    try {
        const url = new URL(rawUrl)
        const isPostgres = url.protocol === "postgresql:" || url.protocol === "postgres:"

        if (!isPostgres) {
            return rawUrl
        }

        const isNeonPooledUrl =
            url.hostname.toLowerCase().includes("-pooler.") &&
            url.hostname.toLowerCase().endsWith(".neon.tech")

        if (!url.searchParams.has("connect_timeout")) {
            url.searchParams.set("connect_timeout", process.env.PRISMA_CONNECT_TIMEOUT || "15")
        }

        if (!url.searchParams.has("pool_timeout")) {
            url.searchParams.set("pool_timeout", process.env.PRISMA_POOL_TIMEOUT || "15")
        }

        if (isNeonPooledUrl && !url.searchParams.has("connection_limit")) {
            url.searchParams.set("connection_limit", process.env.PRISMA_CONNECTION_LIMIT || "10")
        }

        return url.toString()
    } catch {
        return rawUrl
    }
}

const prismaClientSingleton = () => {
    const dbUrl = withPrismaConnectionDefaults(process.env.DATABASE_URL)
    const isDev = process.env.NODE_ENV === "development"
    const globalRuntimeState = globalThis as unknown as {
        prisma_init_logged?: boolean
        prisma_missing_url_warned?: boolean
        prisma_transient_event_warned?: boolean
    }

    if (isDev && process.env.PRISMA_DEBUG_INIT === "true" && !globalRuntimeState.prisma_init_logged) {
        console.log("[PRISMA] Initializing client")
        console.log("[PRISMA] DATABASE_URL:", maskConnectionUrl(dbUrl))
        console.log("[PRISMA] NODE_ENV:", process.env.NODE_ENV)
        globalRuntimeState.prisma_init_logged = true
    }

    if (isDev && !dbUrl && !globalRuntimeState.prisma_missing_url_warned) {
        console.warn("[PRISMA] DATABASE_URL is missing. Connection will likely fail.")
        globalRuntimeState.prisma_missing_url_warned = true
    }

    const client = new PrismaClient({
        // Event-based logging is required for the $on("error") / $on("warn") listeners below.
        log: [
            { emit: "event", level: "error" },
            { emit: "event", level: "warn" },
        ],
        // Only pass datasources override when URL is defined.
        // Prisma v5 throws PrismaClientConstructorValidationError if url is `undefined`.
        // When omitted, Prisma reads DATABASE_URL from the environment directly (via schema.prisma).
        ...(dbUrl ? {
            datasources: {
                db: {
                    url: dbUrl,
                },
            },
        } : {}),
    })

    // @ts-ignore
    client.$on("error", (e: any) => {
        const msg = e.message || String(e);
        if (isTransientPrismaEventMessage(msg)) {
            if (
                process.env.PRISMA_LOG_TRANSIENT_ERRORS === "true" &&
                !globalRuntimeState.prisma_transient_event_warned
            ) {
                console.warn("[PRISMA TRANSIENT]", msg);
                globalRuntimeState.prisma_transient_event_warned = true
            }
            return;
        }
        console.error("[PRISMA ERROR]", msg);
    })

// @ts-ignore
client.$on("warn", (e: any) => {
    console.warn("[PRISMA WARN]", e.message || String(e));
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
