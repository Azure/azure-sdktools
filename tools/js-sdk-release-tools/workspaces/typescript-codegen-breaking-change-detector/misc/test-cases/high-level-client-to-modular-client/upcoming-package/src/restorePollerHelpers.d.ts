import { PollerLike, OperationState } from "@azure/core-lro";
import { NetworkAnalyticsContext } from "./api/networkAnalyticsContext.js";
import { NetworkAnalyticsClient } from "./networkAnalyticsClient.js";
import { PathUncheckedResponse, OperationOptions } from "@azure-rest/core-client";
import { AbortSignalLike } from "@azure/abort-controller";
export interface RestorePollerOptions<TResult, TResponse extends PathUncheckedResponse = PathUncheckedResponse> extends OperationOptions {
    /** Delay to wait until next poll, in milliseconds. */
    updateIntervalInMs?: number;
    /**
     * The signal which can be used to abort requests.
     */
    abortSignal?: AbortSignalLike;
    /** Deserialization function for raw response body */
    processResponseBody?: (result: TResponse) => Promise<TResult>;
}
/**
 * Creates a poller from the serialized state of another poller. This can be
 * useful when you want to create pollers on a different host or a poller
 * needs to be constructed after the original one is not in scope.
 */
export declare function restorePoller<TResponse extends PathUncheckedResponse, TResult>(client: NetworkAnalyticsContext | NetworkAnalyticsClient, serializedState: string, sourceOperation: (...args: any[]) => PollerLike<OperationState<TResult>, TResult>, options?: RestorePollerOptions<TResult>): PollerLike<OperationState<TResult>, TResult>;
//# sourceMappingURL=restorePollerHelpers.d.ts.map