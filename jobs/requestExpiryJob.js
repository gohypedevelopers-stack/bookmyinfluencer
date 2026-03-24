import { expirePendingRequestsAndRefill } from "@/services/collabService";

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;
const JOB_HANDLE_KEY = "__brandRequestExpiryJobHandle";

function isMissingRelationError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes('does not exist') || message.includes('P2021');
}

export async function runRequestExpiryJobOnce() {
    try {
        return await expirePendingRequestsAndRefill();
    } catch (error) {
        if (isMissingRelationError(error)) {
            return { expiredCount: 0, refilledCampaignIds: [] };
        }
        throw error;
    }
}

export function ensureRequestExpiryJobStarted() {
    if (typeof window !== "undefined") {
        return false;
    }

    if (globalThis[JOB_HANDLE_KEY]) {
        return false;
    }

    const configuredInterval = Number(process.env.BRAND_REQUEST_EXPIRY_INTERVAL_MS || DEFAULT_INTERVAL_MS);
    const intervalMs = Number.isFinite(configuredInterval) && configuredInterval > 0
        ? configuredInterval
        : DEFAULT_INTERVAL_MS;

    const runner = async () => {
        try {
            await expirePendingRequestsAndRefill();
        } catch (error) {
            if (isMissingRelationError(error)) {
                return;
            }
            console.error("[requestExpiryJob] Failed to process collaboration request expiry", error);
        }
    };

    const handle = setInterval(() => {
        void runner();
    }, intervalMs);

    if (typeof handle.unref === "function") {
        handle.unref();
    }

    globalThis[JOB_HANDLE_KEY] = handle;
    return true;
}
