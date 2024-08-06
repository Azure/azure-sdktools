import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { SimplePollerLike, OperationState } from "@azure/core-lro";
import { DataProduct, DataProductsListBySubscriptionOptionalParams, DataProductsListByResourceGroupOptionalParams, DataProductsGetOptionalParams, DataProductsGetResponse, DataProductsCreateOptionalParams, DataProductsCreateResponse, DataProductUpdate, DataProductsUpdateOptionalParams, DataProductsUpdateResponse, DataProductsDeleteOptionalParams, DataProductsDeleteResponse, RoleAssignmentCommonProperties, DataProductsAddUserRoleOptionalParams, DataProductsAddUserRoleResponse, AccountSas, DataProductsGenerateStorageAccountSasTokenOptionalParams, DataProductsGenerateStorageAccountSasTokenResponse, DataProductsListRolesAssignmentsOptionalParams, DataProductsListRolesAssignmentsResponse, RoleAssignmentDetail, DataProductsRemoveUserRoleOptionalParams, KeyVaultInfo, DataProductsRotateKeyOptionalParams } from "../models";
/** Interface representing a DataProducts. */
export interface DataProducts {
    /**
     * List data products by subscription.
     * @param options The options parameters.
     */
    listBySubscription(options?: DataProductsListBySubscriptionOptionalParams): PagedAsyncIterableIterator<DataProduct>;
    /**
     * List data products by resource group.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param options The options parameters.
     */
    listByResourceGroup(resourceGroupName: string, options?: DataProductsListByResourceGroupOptionalParams): PagedAsyncIterableIterator<DataProduct>;
    /**
     * Retrieve data product resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param options The options parameters.
     */
    get(resourceGroupName: string, dataProductName: string, options?: DataProductsGetOptionalParams): Promise<DataProductsGetResponse>;
    /**
     * Create data product resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param resource Resource create parameters.
     * @param options The options parameters.
     */
    beginCreate(resourceGroupName: string, dataProductName: string, resource: DataProduct, options?: DataProductsCreateOptionalParams): Promise<SimplePollerLike<OperationState<DataProductsCreateResponse>, DataProductsCreateResponse>>;
    /**
     * Create data product resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param resource Resource create parameters.
     * @param options The options parameters.
     */
    beginCreateAndWait(resourceGroupName: string, dataProductName: string, resource: DataProduct, options?: DataProductsCreateOptionalParams): Promise<DataProductsCreateResponse>;
    /**
     * Update data product resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param properties The resource properties to be updated.
     * @param options The options parameters.
     */
    beginUpdate(resourceGroupName: string, dataProductName: string, properties: DataProductUpdate, options?: DataProductsUpdateOptionalParams): Promise<SimplePollerLike<OperationState<DataProductsUpdateResponse>, DataProductsUpdateResponse>>;
    /**
     * Update data product resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param properties The resource properties to be updated.
     * @param options The options parameters.
     */
    beginUpdateAndWait(resourceGroupName: string, dataProductName: string, properties: DataProductUpdate, options?: DataProductsUpdateOptionalParams): Promise<DataProductsUpdateResponse>;
    /**
     * Delete data product resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param options The options parameters.
     */
    beginDelete(resourceGroupName: string, dataProductName: string, options?: DataProductsDeleteOptionalParams): Promise<SimplePollerLike<OperationState<DataProductsDeleteResponse>, DataProductsDeleteResponse>>;
    /**
     * Delete data product resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param options The options parameters.
     */
    beginDeleteAndWait(resourceGroupName: string, dataProductName: string, options?: DataProductsDeleteOptionalParams): Promise<DataProductsDeleteResponse>;
    /**
     * Assign role to the data product.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param body The content of the action request
     * @param options The options parameters.
     */
    addUserRole(resourceGroupName: string, dataProductName: string, body: RoleAssignmentCommonProperties, options?: DataProductsAddUserRoleOptionalParams): Promise<DataProductsAddUserRoleResponse>;
    /**
     * Generate sas token for storage account.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param body The content of the action request
     * @param options The options parameters.
     */
    generateStorageAccountSasToken(resourceGroupName: string, dataProductName: string, body: AccountSas, options?: DataProductsGenerateStorageAccountSasTokenOptionalParams): Promise<DataProductsGenerateStorageAccountSasTokenResponse>;
    /**
     * List user roles associated with the data product.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param body The content of the action request
     * @param options The options parameters.
     */
    listRolesAssignments(resourceGroupName: string, dataProductName: string, body: Record<string, unknown>, options?: DataProductsListRolesAssignmentsOptionalParams): Promise<DataProductsListRolesAssignmentsResponse>;
    /**
     * Remove role from the data product.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param body The content of the action request
     * @param options The options parameters.
     */
    removeUserRole(resourceGroupName: string, dataProductName: string, body: RoleAssignmentDetail, options?: DataProductsRemoveUserRoleOptionalParams): Promise<void>;
    /**
     * Initiate key rotation on Data Product.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param body The content of the action request
     * @param options The options parameters.
     */
    rotateKey(resourceGroupName: string, dataProductName: string, body: KeyVaultInfo, options?: DataProductsRotateKeyOptionalParams): Promise<void>;
}
//# sourceMappingURL=dataProducts.d.ts.map