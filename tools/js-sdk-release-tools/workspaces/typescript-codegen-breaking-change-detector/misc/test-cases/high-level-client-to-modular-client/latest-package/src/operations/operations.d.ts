import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { Operations } from "../operationsInterfaces";
import { MicrosoftNetworkAnalytics } from "../microsoftNetworkAnalytics";
import { Operation, OperationsListOptionalParams } from "../models";
/** Class containing Operations operations. */
export declare class OperationsImpl implements Operations {
    private readonly client;
    /**
     * Initialize a new instance of the class Operations class.
     * @param client Reference to the service client
     */
    constructor(client: MicrosoftNetworkAnalytics);
    /**
     * List the operations for the provider
     * @param options The options parameters.
     */
    list(options?: OperationsListOptionalParams): PagedAsyncIterableIterator<Operation>;
    private listPagingPage;
    private listPagingAll;
    /**
     * List the operations for the provider
     * @param options The options parameters.
     */
    private _list;
    /**
     * ListNext
     * @param nextLink The nextLink from the previous successful call to the List method.
     * @param options The options parameters.
     */
    private _listNext;
}
//# sourceMappingURL=operations.d.ts.map