import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { DataTypes } from "../operationsInterfaces";
import { MicrosoftNetworkAnalytics } from "../microsoftNetworkAnalytics";
import { SimplePollerLike, OperationState } from "@azure/core-lro";
import { DataType, DataTypesListByDataProductOptionalParams, DataTypesGetOptionalParams, DataTypesGetResponse, DataTypesCreateOptionalParams, DataTypesCreateResponse, DataTypeUpdate, DataTypesUpdateOptionalParams, DataTypesUpdateResponse, DataTypesDeleteOptionalParams, DataTypesDeleteResponse, DataTypesDeleteDataOptionalParams, DataTypesDeleteDataResponse, ContainerSaS, DataTypesGenerateStorageContainerSasTokenOptionalParams, DataTypesGenerateStorageContainerSasTokenResponse } from "../models";
/** Class containing DataTypes operations. */
export declare class DataTypesImpl implements DataTypes {
    private readonly client;
    /**
     * Initialize a new instance of the class DataTypes class.
     * @param client Reference to the service client
     */
    constructor(client: MicrosoftNetworkAnalytics);
    /**
     * List data type by parent resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param options The options parameters.
     */
    listByDataProduct(resourceGroupName: string, dataProductName: string, options?: DataTypesListByDataProductOptionalParams): PagedAsyncIterableIterator<DataType>;
    private listByDataProductPagingPage;
    private listByDataProductPagingAll;
    /**
     * List data type by parent resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param options The options parameters.
     */
    private _listByDataProduct;
    /**
     * Retrieve data type resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param dataTypeName The data type name.
     * @param options The options parameters.
     */
    get(resourceGroupName: string, dataProductName: string, dataTypeName: string, options?: DataTypesGetOptionalParams): Promise<DataTypesGetResponse>;
    /**
     * Create data type resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param dataTypeName The data type name.
     * @param resource Resource create parameters.
     * @param options The options parameters.
     */
    beginCreate(resourceGroupName: string, dataProductName: string, dataTypeName: string, resource: DataType, options?: DataTypesCreateOptionalParams): Promise<SimplePollerLike<OperationState<DataTypesCreateResponse>, DataTypesCreateResponse>>;
    /**
     * Create data type resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param dataTypeName The data type name.
     * @param resource Resource create parameters.
     * @param options The options parameters.
     */
    beginCreateAndWait(resourceGroupName: string, dataProductName: string, dataTypeName: string, resource: DataType, options?: DataTypesCreateOptionalParams): Promise<DataTypesCreateResponse>;
    /**
     * Update data type resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param dataTypeName The data type name.
     * @param properties The resource properties to be updated.
     * @param options The options parameters.
     */
    beginUpdate(resourceGroupName: string, dataProductName: string, dataTypeName: string, properties: DataTypeUpdate, options?: DataTypesUpdateOptionalParams): Promise<SimplePollerLike<OperationState<DataTypesUpdateResponse>, DataTypesUpdateResponse>>;
    /**
     * Update data type resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param dataTypeName The data type name.
     * @param properties The resource properties to be updated.
     * @param options The options parameters.
     */
    beginUpdateAndWait(resourceGroupName: string, dataProductName: string, dataTypeName: string, properties: DataTypeUpdate, options?: DataTypesUpdateOptionalParams): Promise<DataTypesUpdateResponse>;
    /**
     * Delete data type resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param dataTypeName The data type name.
     * @param options The options parameters.
     */
    beginDelete(resourceGroupName: string, dataProductName: string, dataTypeName: string, options?: DataTypesDeleteOptionalParams): Promise<SimplePollerLike<OperationState<DataTypesDeleteResponse>, DataTypesDeleteResponse>>;
    /**
     * Delete data type resource.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param dataTypeName The data type name.
     * @param options The options parameters.
     */
    beginDeleteAndWait(resourceGroupName: string, dataProductName: string, dataTypeName: string, options?: DataTypesDeleteOptionalParams): Promise<DataTypesDeleteResponse>;
    /**
     * Delete data for data type.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param dataTypeName The data type name.
     * @param body The content of the action request
     * @param options The options parameters.
     */
    beginDeleteData(resourceGroupName: string, dataProductName: string, dataTypeName: string, body: Record<string, unknown>, options?: DataTypesDeleteDataOptionalParams): Promise<SimplePollerLike<OperationState<DataTypesDeleteDataResponse>, DataTypesDeleteDataResponse>>;
    /**
     * Delete data for data type.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param dataTypeName The data type name.
     * @param body The content of the action request
     * @param options The options parameters.
     */
    beginDeleteDataAndWait(resourceGroupName: string, dataProductName: string, dataTypeName: string, body: Record<string, unknown>, options?: DataTypesDeleteDataOptionalParams): Promise<DataTypesDeleteDataResponse>;
    /**
     * Generate sas token for storage container.
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param dataTypeName The data type name.
     * @param body The content of the action request
     * @param options The options parameters.
     */
    generateStorageContainerSasToken(resourceGroupName: string, dataProductName: string, dataTypeName: string, body: ContainerSaS, options?: DataTypesGenerateStorageContainerSasTokenOptionalParams): Promise<DataTypesGenerateStorageContainerSasTokenResponse>;
    /**
     * ListByDataProductNext
     * @param resourceGroupName The name of the resource group. The name is case insensitive.
     * @param dataProductName The data product resource name
     * @param nextLink The nextLink from the previous successful call to the ListByDataProduct method.
     * @param options The options parameters.
     */
    private _listByDataProductNext;
}
//# sourceMappingURL=dataTypes.d.ts.map