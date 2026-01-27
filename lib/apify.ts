import { ApifyClient } from 'apify-client';

export interface ApifyRunOptions {
    token: string;
    actorId: string; // The user's actor ID (e.g. "username/actor-name")
    input: Record<string, any>;
    timeoutSecs?: number;
}

export interface ApifyResult<T> {
    data: T | null; // The items from the dataset
    error?: string;
}

/**
 * Runs an Apify actor and returns the items from the default dataset.
 */
export async function runApifyActor<T = any>(
    options: ApifyRunOptions
): Promise<ApifyResult<T>> {
    const { token, actorId, input, timeoutSecs = 120 } = options;

    try {
        const client = new ApifyClient({
            token: token,
        });

        // 1. Start the actor and wait for it to finish
        // waitSecs helps avoid long-polling timeout issues if needed, but .call() handles polling.
        const run = await client.actor(actorId).call(input, {
            waitSecs: timeoutSecs,
        });

        if (!run) {
            return { data: null, error: "Actor run failed to start or returned no run object." };
        }

        // 2. Check status
        if (run.status !== 'SUCCEEDED') {
            return { data: null, error: `Actor run finished with status: ${run.status}` };
        }

        // 3. Fetch results from the default dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        if (!items || items.length === 0) {
            // Some actors might succeed but return empty data
            // We return empty array rather than error, let caller decide.
            // Be careful to return compatible type. If T is array, [] is fine.
            return { data: [] as unknown as T };
        }

        return { data: items as unknown as T };

    } catch (error: any) {
        console.error("[Apify] Run Error:", error);
        return { data: null, error: error.message || "Unknown Apify error" };
    }
}
