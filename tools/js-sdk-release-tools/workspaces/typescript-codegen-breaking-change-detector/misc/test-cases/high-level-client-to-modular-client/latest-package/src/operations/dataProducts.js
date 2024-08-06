"use strict";
/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProductsImpl = void 0;
const tslib_1 = require("tslib");
const pagingHelper_1 = require("../pagingHelper");
const coreClient = tslib_1.__importStar(require("@azure/core-client"));
const Mappers = tslib_1.__importStar(require("../models/mappers"));
const Parameters = tslib_1.__importStar(require("../models/parameters"));
const core_lro_1 = require("@azure/core-lro");
const lroImpl_1 = require("../lroImpl");
/// <reference lib="esnext.asynciterable" />
/** Class containing DataProducts operations. */
class DataProductsImpl {
    client;
    /**
     * Initialize a new instance of the class DataProducts class.
     * @param client Reference to the service client
     */
    constructor(client) {
        this.client = client;
    }
    /**
     * List data products by subscription.
     * @param options The options parameters.
     */
    listBySubscription(options) {
        const iter = this.listBySubscriptionPagingAll(options);
        return {
            next() {
                return iter.next();
            },
            [Symbol.asyncIterator]() {
                return this;
            },
            byPage: (settings) => {
                if (settings?.maxPageSize) {
                    throw new Error("maxPageSize is not supported by this operation.");
                }
                return this.listBySubscriptionPagingPage(options, settings);
            }
        };
    }
    async *listBySubscriptionPagingPage(options, settings) {
        let result;
        let continuationToken = settings?.continuationToken;
        if (!continuationToken) {
            result = await this._listBySubscription(options);
            let page = result.value || [];
            continuationToken = result.nextLink;
            (0, pagingHelper_1.setContinuationToken)(page, continuationToken);
            yield page;
        }
        while (continuationToken) {
            result = await this._listBySubscriptionNext(continuationToken, options);
            continuationToken = result.nextLink;
            let page = result.value || [];
            (0, pagingHelper_1.setContinuationToken)(page, continuationToken);
            yield page;
        }
    }
    async *listBySubscriptionPagingAll(options) {
        for await (const page of this.listBySubscriptionPagingPage(options)) {
            yield* page;
        }
    }
    /**
     * List data products by resource group.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param options The options parameters.
     */
    listByResourceGroup(resourceGroupName, options) {
        const iter = this.listByResourceGroupPagingAll(resourceGroupName, options);
        return {
            next() {
                return iter.next();
            },
            [Symbol.asyncIterator]() {
                return this;
            },
            byPage: (settings) => {
                if (settings?.maxPageSize) {
                    throw new Error("maxPageSize is not supported by this operation.");
                }
                return this.listByResourceGroupPagingPage(resourceGroupName, options, settings);
            }
        };
    }
    async *listByResourceGroupPagingPage(resourceGroupName, options, settings) {
        let result;
        let continuationToken = settings?.continuationToken;
        if (!continuationToken) {
            result = await this._listByResourceGroup(resourceGroupName, options);
            let page = result.value || [];
            continuationToken = result.nextLink;
            (0, pagingHelper_1.setContinuationToken)(page, continuationToken);
            yield page;
        }
        while (continuationToken) {
            result = await this._listByResourceGroupNext(resourceGroupName, continuationToken, options);
            continuationToken = result.nextLink;
            let page = result.value || [];
            (0, pagingHelper_1.setContinuationToken)(page, continuationToken);
            yield page;
        }
    }
    async *listByResourceGroupPagingAll(resourceGroupName, options) {
        for await (const page of this.listByResourceGroupPagingPage(resourceGroupName, options)) {
            yield* page;
        }
    }
    /**
     * List data products by subscription.
     * @param options The options parameters.
     */
    _listBySubscription(options) {
        return this.client.sendOperationRequest({ options }, listBySubscriptionOperationSpec);
    }
    /**
     * List data products by resource group.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param options The options parameters.
     */
    _listByResourceGroup(resourceGroupName, options) {
        return this.client.sendOperationRequest({ resourceGroupName, options }, listByResourceGroupOperationSpec);
    }
    /**
     * Retrieve data product resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param options The options parameters.
     */
    get(resourceGroupName, dataProductName, options) {
        return this.client.sendOperationRequest({ resourceGroupName, dataProductName, options }, getOperationSpec);
    }
    /**
     * Create data product resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param resource Resource create parameters.
     * @param options The options parameters.
     */
    async beginCreate(resourceGroupName, dataProductName, resource, options) {
        const directSendOperation = async (args, spec) => {
            return this.client.sendOperationRequest(args, spec);
        };
        const sendOperationFn = async (args, spec) => {
            let currentRawResponse = undefined;
            const providedCallback = args.options?.onResponse;
            const callback = (rawResponse, flatResponse) => {
                currentRawResponse = rawResponse;
                providedCallback?.(rawResponse, flatResponse);
            };
            const updatedArgs = {
                ...args,
                options: {
                    ...args.options,
                    onResponse: callback
                }
            };
            const flatResponse = await directSendOperation(updatedArgs, spec);
            return {
                flatResponse,
                rawResponse: {
                    statusCode: currentRawResponse.status,
                    body: currentRawResponse.parsedBody,
                    headers: currentRawResponse.headers.toJSON()
                }
            };
        };
        const lro = (0, lroImpl_1.createLroSpec)({
            sendOperationFn,
            args: { resourceGroupName, dataProductName, resource, options },
            spec: createOperationSpec
        });
        const poller = await (0, core_lro_1.createHttpPoller)(lro, {
            restoreFrom: options?.resumeFrom,
            intervalInMs: options?.updateIntervalInMs,
            resourceLocationConfig: "azure-async-operation"
        });
        await poller.poll();
        return poller;
    }
    /**
     * Create data product resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param resource Resource create parameters.
     * @param options The options parameters.
     */
    async beginCreateAndWait(resourceGroupName, dataProductName, resource, options) {
        const poller = await this.beginCreate(resourceGroupName, dataProductName, resource, options);
        return poller.pollUntilDone();
    }
    /**
     * Update data product resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param properties The resource properties to be updated.
     * @param options The options parameters.
     */
    async beginUpdate(resourceGroupName, dataProductName, properties, options) {
        const directSendOperation = async (args, spec) => {
            return this.client.sendOperationRequest(args, spec);
        };
        const sendOperationFn = async (args, spec) => {
            let currentRawResponse = undefined;
            const providedCallback = args.options?.onResponse;
            const callback = (rawResponse, flatResponse) => {
                currentRawResponse = rawResponse;
                providedCallback?.(rawResponse, flatResponse);
            };
            const updatedArgs = {
                ...args,
                options: {
                    ...args.options,
                    onResponse: callback
                }
            };
            const flatResponse = await directSendOperation(updatedArgs, spec);
            return {
                flatResponse,
                rawResponse: {
                    statusCode: currentRawResponse.status,
                    body: currentRawResponse.parsedBody,
                    headers: currentRawResponse.headers.toJSON()
                }
            };
        };
        const lro = (0, lroImpl_1.createLroSpec)({
            sendOperationFn,
            args: { resourceGroupName, dataProductName, properties, options },
            spec: updateOperationSpec
        });
        const poller = await (0, core_lro_1.createHttpPoller)(lro, {
            restoreFrom: options?.resumeFrom,
            intervalInMs: options?.updateIntervalInMs,
            resourceLocationConfig: "location"
        });
        await poller.poll();
        return poller;
    }
    /**
     * Update data product resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param properties The resource properties to be updated.
     * @param options The options parameters.
     */
    async beginUpdateAndWait(resourceGroupName, dataProductName, properties, options) {
        const poller = await this.beginUpdate(resourceGroupName, dataProductName, properties, options);
        return poller.pollUntilDone();
    }
    /**
     * Delete data product resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param options The options parameters.
     */
    async beginDelete(resourceGroupName, dataProductName, options) {
        const directSendOperation = async (args, spec) => {
            return this.client.sendOperationRequest(args, spec);
        };
        const sendOperationFn = async (args, spec) => {
            let currentRawResponse = undefined;
            const providedCallback = args.options?.onResponse;
            const callback = (rawResponse, flatResponse) => {
                currentRawResponse = rawResponse;
                providedCallback?.(rawResponse, flatResponse);
            };
            const updatedArgs = {
                ...args,
                options: {
                    ...args.options,
                    onResponse: callback
                }
            };
            const flatResponse = await directSendOperation(updatedArgs, spec);
            return {
                flatResponse,
                rawResponse: {
                    statusCode: currentRawResponse.status,
                    body: currentRawResponse.parsedBody,
                    headers: currentRawResponse.headers.toJSON()
                }
            };
        };
        const lro = (0, lroImpl_1.createLroSpec)({
            sendOperationFn,
            args: { resourceGroupName, dataProductName, options },
            spec: deleteOperationSpec
        });
        const poller = await (0, core_lro_1.createHttpPoller)(lro, {
            restoreFrom: options?.resumeFrom,
            intervalInMs: options?.updateIntervalInMs,
            resourceLocationConfig: "location"
        });
        await poller.poll();
        return poller;
    }
    /**
     * Delete data product resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param options The options parameters.
     */
    async beginDeleteAndWait(resourceGroupName, dataProductName, options) {
        const poller = await this.beginDelete(resourceGroupName, dataProductName, options);
        return poller.pollUntilDone();
    }
    /**
     * Assign role to the data product.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param body The content of the action request
     * @param options The options parameters.
     */
    addUserRole(resourceGroupName, dataProductName, body, options) {
        return this.client.sendOperationRequest({ resourceGroupName, dataProductName, body, options }, addUserRoleOperationSpec);
    }
    /**
     * Generate sas token for storage account.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param body The content of the action request
     * @param options The options parameters.
     */
    generateStorageAccountSasToken(resourceGroupName, dataProductName, body, options) {
        return this.client.sendOperationRequest({ resourceGroupName, dataProductName, body, options }, generateStorageAccountSasTokenOperationSpec);
    }
    /**
     * List user roles associated with the data product.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param body The content of the action request
     * @param options The options parameters.
     */
    listRolesAssignments(resourceGroupName, dataProductName, body, options) {
        return this.client.sendOperationRequest({ resourceGroupName, dataProductName, body, options }, listRolesAssignmentsOperationSpec);
    }
    /**
     * Remove role from the data product.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param body The content of the action request
     * @param options The options parameters.
     */
    removeUserRole(resourceGroupName, dataProductName, body, options) {
        return this.client.sendOperationRequest({ resourceGroupName, dataProductName, body, options }, removeUserRoleOperationSpec);
    }
    /**
     * Initiate key rotation on Data Product.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param body The content of the action request
     * @param options The options parameters.
     */
    rotateKey(resourceGroupName, dataProductName, body, options) {
        return this.client.sendOperationRequest({ resourceGroupName, dataProductName, body, options }, rotateKeyOperationSpec);
    }
    /**
     * ListBySubscriptionNext
     * @param nextLink The nextLink from the previous successful call to the ListBySubscription method.
     * @param options The options parameters.
     */
    _listBySubscriptionNext(nextLink, options) {
        return this.client.sendOperationRequest({ nextLink, options }, listBySubscriptionNextOperationSpec);
    }
    /**
     * ListByResourceGroupNext
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param nextLink The nextLink from the previous successful call to the ListByResourceGroup method.
     * @param options The options parameters.
     */
    _listByResourceGroupNext(resourceGroupName, nextLink, options) {
        return this.client.sendOperationRequest({ resourceGroupName, nextLink, options }, listByResourceGroupNextOperationSpec);
    }
}
exports.DataProductsImpl = DataProductsImpl;
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);
const listBySubscriptionOperationSpec = {
    path: "/subscriptions/{subscriptionId}/providers/Microsoft.NetworkAnalytics/dataProducts",
    httpMethod: "GET",
    responses: {
        200: {
            bodyMapper: Mappers.DataProductListResult
        },
        default: {
            bodyMapper: Mappers.ErrorResponse
        }
    },
    queryParameters: [Parameters.apiVersion],
    urlParameters: [Parameters.$host, Parameters.subscriptionId],
    headerParameters: [Parameters.accept],
    serializer
};
const listByResourceGroupOperationSpec = {
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkAnalytics/dataProducts",
    httpMethod: "GET",
    responses: {
        200: {
            bodyMapper: Mappers.DataProductListResult
        },
        default: {
            bodyMapper: Mappers.ErrorResponse
        }
    },
    queryParameters: [Parameters.apiVersion],
    urlParameters: [
        Parameters.$host,
        Parameters.subscriptionId,
        Parameters.resourceGroupName
    ],
    headerParameters: [Parameters.accept],
    serializer
};
const getOperationSpec = {
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkAnalytics/dataProducts/{dataProductName}",
    httpMethod: "GET",
    responses: {
        200: {
            bodyMapper: Mappers.DataProduct
        },
        default: {
            bodyMapper: Mappers.ErrorResponse
        }
    },
    queryParameters: [Parameters.apiVersion],
    urlParameters: [
        Parameters.$host,
        Parameters.subscriptionId,
        Parameters.resourceGroupName,
        Parameters.dataProductName
    ],
    headerParameters: [Parameters.accept],
    serializer
};
const createOperationSpec = {
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkAnalytics/dataProducts/{dataProductName}",
    httpMethod: "PUT",
    responses: {
        200: {
            bodyMapper: Mappers.DataProduct
        },
        201: {
            bodyMapper: Mappers.DataProduct
        },
        202: {
            bodyMapper: Mappers.DataProduct
        },
        204: {
            bodyMapper: Mappers.DataProduct
        },
        default: {
            bodyMapper: Mappers.ErrorResponse
        }
    },
    requestBody: Parameters.resource,
    queryParameters: [Parameters.apiVersion],
    urlParameters: [
        Parameters.$host,
        Parameters.subscriptionId,
        Parameters.resourceGroupName,
        Parameters.dataProductName
    ],
    headerParameters: [Parameters.accept, Parameters.contentType],
    mediaType: "json",
    serializer
};
const updateOperationSpec = {
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkAnalytics/dataProducts/{dataProductName}",
    httpMethod: "PATCH",
    responses: {
        200: {
            bodyMapper: Mappers.DataProduct
        },
        201: {
            bodyMapper: Mappers.DataProduct
        },
        202: {
            bodyMapper: Mappers.DataProduct
        },
        204: {
            bodyMapper: Mappers.DataProduct
        },
        default: {
            bodyMapper: Mappers.ErrorResponse
        }
    },
    requestBody: Parameters.properties,
    queryParameters: [Parameters.apiVersion],
    urlParameters: [
        Parameters.$host,
        Parameters.subscriptionId,
        Parameters.resourceGroupName,
        Parameters.dataProductName
    ],
    headerParameters: [Parameters.accept, Parameters.contentType],
    mediaType: "json",
    serializer
};
const deleteOperationSpec = {
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkAnalytics/dataProducts/{dataProductName}",
    httpMethod: "DELETE",
    responses: {
        200: {
            headersMapper: Mappers.DataProductsDeleteHeaders
        },
        201: {
            headersMapper: Mappers.DataProductsDeleteHeaders
        },
        202: {
            headersMapper: Mappers.DataProductsDeleteHeaders
        },
        204: {
            headersMapper: Mappers.DataProductsDeleteHeaders
        },
        default: {
            bodyMapper: Mappers.ErrorResponse
        }
    },
    queryParameters: [Parameters.apiVersion],
    urlParameters: [
        Parameters.$host,
        Parameters.subscriptionId,
        Parameters.resourceGroupName,
        Parameters.dataProductName
    ],
    headerParameters: [Parameters.accept],
    serializer
};
const addUserRoleOperationSpec = {
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkAnalytics/dataProducts/{dataProductName}/addUserRole",
    httpMethod: "POST",
    responses: {
        200: {
            bodyMapper: Mappers.RoleAssignmentDetail
        },
        default: {
            bodyMapper: Mappers.ErrorResponse
        }
    },
    requestBody: Parameters.body,
    queryParameters: [Parameters.apiVersion],
    urlParameters: [
        Parameters.$host,
        Parameters.subscriptionId,
        Parameters.resourceGroupName,
        Parameters.dataProductName
    ],
    headerParameters: [Parameters.accept, Parameters.contentType],
    mediaType: "json",
    serializer
};
const generateStorageAccountSasTokenOperationSpec = {
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkAnalytics/dataProducts/{dataProductName}/generateStorageAccountSasToken",
    httpMethod: "POST",
    responses: {
        200: {
            bodyMapper: Mappers.AccountSasToken
        },
        default: {
            bodyMapper: Mappers.ErrorResponse
        }
    },
    requestBody: Parameters.body1,
    queryParameters: [Parameters.apiVersion],
    urlParameters: [
        Parameters.$host,
        Parameters.subscriptionId,
        Parameters.resourceGroupName,
        Parameters.dataProductName
    ],
    headerParameters: [Parameters.accept, Parameters.contentType],
    mediaType: "json",
    serializer
};
const listRolesAssignmentsOperationSpec = {
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkAnalytics/dataProducts/{dataProductName}/listRolesAssignments",
    httpMethod: "POST",
    responses: {
        200: {
            bodyMapper: Mappers.ListRoleAssignments
        },
        default: {
            bodyMapper: Mappers.ErrorResponse
        }
    },
    requestBody: Parameters.body2,
    queryParameters: [Parameters.apiVersion],
    urlParameters: [
        Parameters.$host,
        Parameters.subscriptionId,
        Parameters.resourceGroupName,
        Parameters.dataProductName
    ],
    headerParameters: [Parameters.accept, Parameters.contentType],
    mediaType: "json",
    serializer
};
const removeUserRoleOperationSpec = {
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkAnalytics/dataProducts/{dataProductName}/removeUserRole",
    httpMethod: "POST",
    responses: {
        204: {},
        default: {
            bodyMapper: Mappers.ErrorResponse
        }
    },
    requestBody: Parameters.body3,
    queryParameters: [Parameters.apiVersion],
    urlParameters: [
        Parameters.$host,
        Parameters.subscriptionId,
        Parameters.resourceGroupName,
        Parameters.dataProductName
    ],
    headerParameters: [Parameters.accept, Parameters.contentType],
    mediaType: "json",
    serializer
};
const rotateKeyOperationSpec = {
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.NetworkAnalytics/dataProducts/{dataProductName}/rotateKey",
    httpMethod: "POST",
    responses: {
        204: {},
        default: {
            bodyMapper: Mappers.ErrorResponse
        }
    },
    requestBody: Parameters.body4,
    queryParameters: [Parameters.apiVersion],
    urlParameters: [
        Parameters.$host,
        Parameters.subscriptionId,
        Parameters.resourceGroupName,
        Parameters.dataProductName
    ],
    headerParameters: [Parameters.accept, Parameters.contentType],
    mediaType: "json",
    serializer
};
const listBySubscriptionNextOperationSpec = {
    path: "{nextLink}",
    httpMethod: "GET",
    responses: {
        200: {
            bodyMapper: Mappers.DataProductListResult
        },
        default: {
            bodyMapper: Mappers.ErrorResponse
        }
    },
    urlParameters: [
        Parameters.$host,
        Parameters.nextLink,
        Parameters.subscriptionId
    ],
    headerParameters: [Parameters.accept],
    serializer
};
const listByResourceGroupNextOperationSpec = {
    path: "{nextLink}",
    httpMethod: "GET",
    responses: {
        200: {
            bodyMapper: Mappers.DataProductListResult
        },
        default: {
            bodyMapper: Mappers.ErrorResponse
        }
    },
    urlParameters: [
        Parameters.$host,
        Parameters.nextLink,
        Parameters.subscriptionId,
        Parameters.resourceGroupName
    ],
    headerParameters: [Parameters.accept],
    serializer
};
//# sourceMappingURL=dataProducts.js.map