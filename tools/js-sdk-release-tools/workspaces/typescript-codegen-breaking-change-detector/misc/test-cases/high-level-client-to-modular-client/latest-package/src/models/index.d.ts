import * as coreClient from "@azure/core-client";
/** A list of REST API operations supported by an Azure Resource Provider. It contains an URL link to get the next set of results. */
export interface OperationListResult {
    /**
     * List of operations supported by the resource provider
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly value?: Operation[];
    /**
     * URL to get the next set of operation list results (if there are any).
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly nextLink?: string;
}
/** Details of a REST API operation, returned from the Resource Provider Operations API */
export interface Operation {
    /**
     * The name of the operation, as per Resource-Based Access Control (RBAC). Examples: "Microsoft.Compute/virtualMachines/write", "Microsoft.Compute/virtualMachines/capture/action"
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly name?: string;
    /**
     * Whether the operation applies to data-plane. This is "true" for data-plane operations and "false" for ARM/control-plane operations.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly isDataAction?: boolean;
    /** Localized display information for this particular operation. */
    display?: OperationDisplay;
    /**
     * The intended executor of the operation; as in Resource Based Access Control (RBAC) and audit logs UX. Default value is "user,system"
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly origin?: Origin;
    /**
     * Enum. Indicates the action type. "Internal" refers to actions that are for internal only APIs.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly actionType?: ActionType;
}
/** Localized display information for this particular operation. */
export interface OperationDisplay {
    /**
     * The localized friendly form of the resource provider name, e.g. "Microsoft Monitoring Insights" or "Microsoft Compute".
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly provider?: string;
    /**
     * The localized friendly name of the resource type related to this operation. E.g. "Virtual Machines" or "Job Schedule Collections".
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly resource?: string;
    /**
     * The concise, localized friendly name for the operation; suitable for dropdowns. E.g. "Create or Update Virtual Machine", "Restart Virtual Machine".
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly operation?: string;
    /**
     * The short, localized friendly description of the operation; suitable for tool tips and detailed views.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly description?: string;
}
/** Common error response for all Azure Resource Manager APIs to return error details for failed operations. (This also follows the OData error response format.). */
export interface ErrorResponse {
    /** The error object. */
    error?: ErrorDetail;
}
/** The error detail. */
export interface ErrorDetail {
    /**
     * The error code.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly code?: string;
    /**
     * The error message.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly message?: string;
    /**
     * The error target.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly target?: string;
    /**
     * The error details.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly details?: ErrorDetail[];
    /**
     * The error additional info.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly additionalInfo?: ErrorAdditionalInfo[];
}
/** The resource management error additional info. */
export interface ErrorAdditionalInfo {
    /**
     * The additional info type.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly type?: string;
    /**
     * The additional info.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly info?: Record<string, unknown>;
}
/** The response of a DataProduct list operation. */
export interface DataProductListResult {
    /** The DataProduct items on this page */
    value: DataProduct[];
    /** The link to the next page of items */
    nextLink?: string;
}
/** The data product properties. */
export interface DataProductProperties {
    /**
     * The resource GUID property of the data product resource.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly resourceGuid?: string;
    /**
     * Latest provisioning state  of data product.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly provisioningState?: ProvisioningState;
    /** Data product publisher name. */
    publisher: string;
    /** Product name of data product. */
    product: string;
    /** Major version of data product. */
    majorVersion: string;
    /** List of name or email associated with data product resource deployment. */
    owners?: string[];
    /** Flag to enable or disable redundancy for data product. */
    redundancy?: ControlState;
    /** Purview account url for data product to connect to. */
    purviewAccount?: string;
    /** Purview collection url for data product to connect to. */
    purviewCollection?: string;
    /** Flag to enable or disable private link for data product resource. */
    privateLinksEnabled?: ControlState;
    /** Flag to enable or disable public access of data product resource. */
    publicNetworkAccess?: ControlState;
    /** Flag to enable customer managed key encryption for data product. */
    customerManagedKeyEncryptionEnabled?: ControlState;
    /** Customer managed encryption key details for data product. */
    customerEncryptionKey?: EncryptionKeyDetails;
    /** Network rule set for data product. */
    networkacls?: DataProductNetworkAcls;
    /** Managed resource group configuration. */
    managedResourceGroupConfiguration?: ManagedResourceGroupConfiguration;
    /**
     * List of available minor versions of the data product resource.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly availableMinorVersions?: string[];
    /** Current configured minor version of the data product resource. */
    currentMinorVersion?: string;
    /**
     * Documentation link for the data product based on definition file.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly documentation?: string;
    /**
     * Resource links which exposed to the customer to query the data.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly consumptionEndpoints?: ConsumptionEndpointsProperties;
    /**
     * Key vault url.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly keyVaultUrl?: string;
}
/** Encryption key details. */
export interface EncryptionKeyDetails {
    /** The Uri of the key vault. */
    keyVaultUri: string;
    /** The name of the key vault key. */
    keyName: string;
    /** The version of the key vault key. */
    keyVersion: string;
}
/** Data Product Network rule set */
export interface DataProductNetworkAcls {
    /** Virtual Network Rule */
    virtualNetworkRule: VirtualNetworkRule[];
    /** IP rule with specific IP or IP range in CIDR format. */
    ipRules: IPRules[];
    /** The list of query ips in the format of CIDR allowed to connect to query/visualization endpoint. */
    allowedQueryIpRangeList: string[];
    /** Default Action */
    defaultAction: DefaultAction;
}
/** Virtual Network Rule */
export interface VirtualNetworkRule {
    /** Resource ID of a subnet */
    id: string;
    /** The action of virtual network rule. */
    action?: string;
    /** Gets the state of virtual network rule. */
    state?: string;
}
/** IP rule with specific IP or IP range in CIDR format. */
export interface IPRules {
    /** IP Rules Value */
    value?: string;
    /** The action of virtual network rule. */
    action: string;
}
/** ManagedResourceGroup related properties */
export interface ManagedResourceGroupConfiguration {
    /** Name of managed resource group */
    name: string;
    /** Managed Resource Group location */
    location: string;
}
/** Details of Consumption Properties */
export interface ConsumptionEndpointsProperties {
    /**
     * Ingestion url to upload the data.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly ingestionUrl?: string;
    /**
     * Resource Id of ingestion endpoint.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly ingestionResourceId?: string;
    /**
     * Url to consume file type.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly fileAccessUrl?: string;
    /**
     * Resource Id of file access endpoint.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly fileAccessResourceId?: string;
    /**
     * Url to consume the processed data.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly queryUrl?: string;
    /**
     * Resource Id of query endpoint.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly queryResourceId?: string;
}
/** Managed service identity (system assigned and/or user assigned identities) */
export interface ManagedServiceIdentity {
    /**
     * The service principal ID of the system assigned identity. This property will only be provided for a system assigned identity.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly principalId?: string;
    /**
     * The tenant ID of the system assigned identity. This property will only be provided for a system assigned identity.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly tenantId?: string;
    /** Type of managed service identity (where both SystemAssigned and UserAssigned types are allowed). */
    type: ManagedServiceIdentityType;
    /** The set of user assigned identities associated with the resource. The userAssignedIdentities dictionary keys will be ARM resource ids in the form: '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}. The dictionary values can be empty objects ({}) in requests. */
    userAssignedIdentities?: {
        [propertyName: string]: UserAssignedIdentity;
    };
}
/** User assigned identity properties */
export interface UserAssignedIdentity {
    /**
     * The principal ID of the assigned identity.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly principalId?: string;
    /**
     * The client ID of the assigned identity.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly clientId?: string;
}
/** Common fields that are returned in the response for all Azure Resource Manager resources */
export interface Resource {
    /**
     * Fully qualified resource ID for the resource. Ex - /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{resourceProviderNamespace}/{resourceType}/{resourceName}
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly id?: string;
    /**
     * The name of the resource
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly name?: string;
    /**
     * The type of the resource. E.g. "Microsoft.Compute/virtualMachines" or "Microsoft.Storage/storageAccounts"
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly type?: string;
    /**
     * Azure Resource Manager metadata containing createdBy and modifiedBy information.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly systemData?: SystemData;
}
/** Metadata pertaining to creation and last modification of the resource. */
export interface SystemData {
    /** The identity that created the resource. */
    createdBy?: string;
    /** The type of identity that created the resource. */
    createdByType?: CreatedByType;
    /** The timestamp of resource creation (UTC). */
    createdAt?: Date;
    /** The identity that last modified the resource. */
    lastModifiedBy?: string;
    /** The type of identity that last modified the resource. */
    lastModifiedByType?: CreatedByType;
    /** The timestamp of resource last modification (UTC) */
    lastModifiedAt?: Date;
}
/** The response of a DataProductsCatalog list operation. */
export interface DataProductsCatalogListResult {
    /** The DataProductsCatalog items on this page */
    value: DataProductsCatalog[];
    /** The link to the next page of items */
    nextLink?: string;
}
/** Details for data catalog properties. */
export interface DataProductsCatalogProperties {
    /**
     * The data catalog provisioning state.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly provisioningState?: ProvisioningState;
    /** The data product publisher information. */
    publishers: PublisherInformation[];
}
/** Details for Publisher Information. */
export interface PublisherInformation {
    /** Name of the publisher. */
    publisherName: string;
    /** Data product information. */
    dataProducts: DataProductInformation[];
}
/** Data Product Information */
export interface DataProductInformation {
    /** Name of data product. */
    dataProductName: string;
    /** Description about data product. */
    description: string;
    /** Version information of data product. */
    dataProductVersions: DataProductVersion[];
}
/** Data Product Version. */
export interface DataProductVersion {
    /** Version of data product */
    version: string;
}
/** The type used for update operations of the DataProduct. */
export interface DataProductUpdate {
    /** The managed service identities assigned to this resource. */
    identity?: ManagedServiceIdentity;
    /** Resource tags. */
    tags?: {
        [propertyName: string]: string;
    };
    /** The updatable properties of the DataProduct. */
    properties?: DataProductUpdateProperties;
}
/** The updatable properties of the DataProduct. */
export interface DataProductUpdateProperties {
    /** List of name or email associated with data product resource deployment. */
    owners?: string[];
    /** Purview account url for data product to connect to. */
    purviewAccount?: string;
    /** Purview collection url for data product to connect to. */
    purviewCollection?: string;
    /** Flag to enable or disable private link for data product resource. */
    privateLinksEnabled?: ControlState;
    /** Current configured minor version of the data product resource. */
    currentMinorVersion?: string;
}
/** The details for role assignment common properties. */
export interface RoleAssignmentCommonProperties {
    /** Role Id of the Built-In Role */
    roleId: string;
    /** Object ID of the AAD principal or security-group. */
    principalId: string;
    /** User name. */
    userName: string;
    /** Data Type Scope at which the role assignment is created. */
    dataTypeScope: string[];
    /** Type of the principal Id: User, Group or ServicePrincipal */
    principalType: string;
    /** Data Product role to be assigned to a user. */
    role: DataProductUserRole;
}
/** The details for role assignment response. */
export interface RoleAssignmentDetail {
    /** Role Id of the Built-In Role */
    roleId: string;
    /** Object ID of the AAD principal or security-group. */
    principalId: string;
    /** User name. */
    userName: string;
    /** Data Type Scope at which the role assignment is created. */
    dataTypeScope: string[];
    /** Type of the principal Id: User, Group or ServicePrincipal */
    principalType: string;
    /** Data Product role to be assigned to a user. */
    role: DataProductUserRole;
    /** Id of role assignment request */
    roleAssignmentId: string;
}
/** The response of a DataType list operation. */
export interface DataTypeListResult {
    /** The DataType items on this page */
    value: DataType[];
    /** The link to the next page of items */
    nextLink?: string;
}
/** The data type properties */
export interface DataTypeProperties {
    /**
     * Latest provisioning state  of data product.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly provisioningState?: ProvisioningState;
    /** State of data type. */
    state?: DataTypeState;
    /**
     * Reason for the state of data type.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly stateReason?: string;
    /** Field for storage output retention in days. */
    storageOutputRetention?: number;
    /** Field for database cache retention in days. */
    databaseCacheRetention?: number;
    /** Field for database data retention in days. */
    databaseRetention?: number;
    /**
     * Url for data visualization.
     * NOTE: This property will not be serialized. It can only be populated by the server.
     */
    readonly visualizationUrl?: string;
}
/** The type used for update operations of the DataType. */
export interface DataTypeUpdate {
    /** The updatable properties of the DataType. */
    properties?: DataTypeUpdateProperties;
}
/** The updatable properties of the DataType. */
export interface DataTypeUpdateProperties {
    /** State of data type. */
    state?: DataTypeState;
    /** Field for storage output retention in days. */
    storageOutputRetention?: number;
    /** Field for database cache retention in days. */
    databaseCacheRetention?: number;
    /** Field for database data retention in days. */
    databaseRetention?: number;
}
/** The details for container sas creation. */
export interface ContainerSaS {
    /** Sas token start timestamp. */
    startTimeStamp: Date;
    /** Sas token expiry timestamp. */
    expiryTimeStamp: Date;
    /** Ip Address */
    ipAddress: string;
}
/** Details of storage container account sas token . */
export interface ContainerSasToken {
    /**
     * Field to specify storage container sas token.
     * This value contains a credential. Consider obscuring before showing to users
     */
    storageContainerSasToken: string;
}
/** The details for storage account sas creation. */
export interface AccountSas {
    /** Sas token start timestamp. */
    startTimeStamp: Date;
    /** Sas token expiry timestamp. */
    expiryTimeStamp: Date;
    /** Ip Address */
    ipAddress: string;
}
/** Details of storage account sas token . */
export interface AccountSasToken {
    /**
     * Field to specify storage account sas token.
     * This value contains a credential. Consider obscuring before showing to users
     */
    storageAccountSasToken: string;
}
/** list role assignments. */
export interface ListRoleAssignments {
    /** Count of role assignments. */
    count: number;
    /** list of role assignments */
    roleAssignmentResponse: RoleAssignmentDetail[];
}
/** Details for KeyVault. */
export interface KeyVaultInfo {
    /** key vault url. */
    keyVaultUrl: string;
}
/** Resource Access Rules. */
export interface ResourceAccessRules {
    /** The tenant ID of resource. */
    tenantId: string;
    /** Resource ID */
    resourceId: string;
}
/** The resource model definition for an Azure Resource Manager tracked top level resource which has 'tags' and a 'location' */
export interface TrackedResource extends Resource {
    /** Resource tags. */
    tags?: {
        [propertyName: string]: string;
    };
    /** The geo-location where the resource lives */
    location: string;
}
/** The resource model definition for a Azure Resource Manager proxy resource. It will not have tags and a location */
export interface ProxyResource extends Resource {
}
/** The data product resource. */
export interface DataProduct extends TrackedResource {
    /** The resource-specific properties for this resource. */
    properties?: DataProductProperties;
    /** The managed service identities assigned to this resource. */
    identity?: ManagedServiceIdentity;
}
/** The data catalog resource. */
export interface DataProductsCatalog extends ProxyResource {
    /** The resource-specific properties for this resource. */
    properties?: DataProductsCatalogProperties;
}
/** The data type resource. */
export interface DataType extends ProxyResource {
    /** The resource-specific properties for this resource. */
    properties?: DataTypeProperties;
}
/** Defines headers for DataProducts_create operation. */
export interface DataProductsCreateHeaders {
    /** The Retry-After header can indicate how long the client should wait before polling the operation status. */
    retryAfter?: number;
}
/** Defines headers for DataProducts_update operation. */
export interface DataProductsUpdateHeaders {
    /** The Retry-After header can indicate how long the client should wait before polling the operation status. */
    retryAfter?: number;
    /** The Location header contains the URL where the status of the long running operation can be checked. */
    location?: string;
}
/** Defines headers for DataProducts_delete operation. */
export interface DataProductsDeleteHeaders {
    /** The Retry-After header can indicate how long the client should wait before polling the operation status. */
    retryAfter?: number;
    /** The Location header contains the URL where the status of the long running operation can be checked. */
    location?: string;
}
/** Defines headers for DataTypes_create operation. */
export interface DataTypesCreateHeaders {
    /** The Retry-After header can indicate how long the client should wait before polling the operation status. */
    retryAfter?: number;
}
/** Defines headers for DataTypes_update operation. */
export interface DataTypesUpdateHeaders {
    /** The Retry-After header can indicate how long the client should wait before polling the operation status. */
    retryAfter?: number;
    /** The Location header contains the URL where the status of the long running operation can be checked. */
    location?: string;
}
/** Defines headers for DataTypes_delete operation. */
export interface DataTypesDeleteHeaders {
    /** The Retry-After header can indicate how long the client should wait before polling the operation status. */
    retryAfter?: number;
    /** The Location header contains the URL where the status of the long running operation can be checked. */
    location?: string;
}
/** Defines headers for DataTypes_deleteData operation. */
export interface DataTypesDeleteDataHeaders {
    /** The Retry-After header can indicate how long the client should wait before polling the operation status. */
    retryAfter?: number;
    /** The Location header contains the URL where the status of the long running operation can be checked. */
    location?: string;
}
/** Known values of {@link Origin} that the service accepts. */
export declare enum KnownOrigin {
    /** User */
    User = "user",
    /** System */
    System = "system",
    /** UserSystem */
    UserSystem = "user,system"
}
/**
 * Defines values for Origin. \
 * {@link KnownOrigin} can be used interchangeably with Origin,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **user** \
 * **system** \
 * **user,system**
 */
export type Origin = string;
/** Known values of {@link ActionType} that the service accepts. */
export declare enum KnownActionType {
    /** Internal */
    Internal = "Internal"
}
/**
 * Defines values for ActionType. \
 * {@link KnownActionType} can be used interchangeably with ActionType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Internal**
 */
export type ActionType = string;
/** Known values of {@link ProvisioningState} that the service accepts. */
export declare enum KnownProvisioningState {
    /** Represents a succeeded operation. */
    Succeeded = "Succeeded",
    /** Represents a failed operation. */
    Failed = "Failed",
    /** Represents a canceled operation. */
    Canceled = "Canceled",
    /** Represents a pending operation. */
    Provisioning = "Provisioning",
    /** Represents a pending operation. */
    Updating = "Updating",
    /** Represents an operation under deletion. */
    Deleting = "Deleting",
    /** Represents an accepted operation. */
    Accepted = "Accepted"
}
/**
 * Defines values for ProvisioningState. \
 * {@link KnownProvisioningState} can be used interchangeably with ProvisioningState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Succeeded**: Represents a succeeded operation. \
 * **Failed**: Represents a failed operation. \
 * **Canceled**: Represents a canceled operation. \
 * **Provisioning**: Represents a pending operation. \
 * **Updating**: Represents a pending operation. \
 * **Deleting**: Represents an operation under deletion. \
 * **Accepted**: Represents an accepted operation.
 */
export type ProvisioningState = string;
/** Known values of {@link ControlState} that the service accepts. */
export declare enum KnownControlState {
    /** Field to enable a setting. */
    Enabled = "Enabled",
    /** Field to disable a setting. */
    Disabled = "Disabled"
}
/**
 * Defines values for ControlState. \
 * {@link KnownControlState} can be used interchangeably with ControlState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Enabled**: Field to enable a setting. \
 * **Disabled**: Field to disable a setting.
 */
export type ControlState = string;
/** Known values of {@link DefaultAction} that the service accepts. */
export declare enum KnownDefaultAction {
    /** Represents allow action. */
    Allow = "Allow",
    /** Represents deny action. */
    Deny = "Deny"
}
/**
 * Defines values for DefaultAction. \
 * {@link KnownDefaultAction} can be used interchangeably with DefaultAction,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Allow**: Represents allow action. \
 * **Deny**: Represents deny action.
 */
export type DefaultAction = string;
/** Known values of {@link ManagedServiceIdentityType} that the service accepts. */
export declare enum KnownManagedServiceIdentityType {
    /** None */
    None = "None",
    /** SystemAssigned */
    SystemAssigned = "SystemAssigned",
    /** UserAssigned */
    UserAssigned = "UserAssigned",
    /** SystemAssignedUserAssigned */
    SystemAssignedUserAssigned = "SystemAssigned, UserAssigned"
}
/**
 * Defines values for ManagedServiceIdentityType. \
 * {@link KnownManagedServiceIdentityType} can be used interchangeably with ManagedServiceIdentityType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **None** \
 * **SystemAssigned** \
 * **UserAssigned** \
 * **SystemAssigned, UserAssigned**
 */
export type ManagedServiceIdentityType = string;
/** Known values of {@link CreatedByType} that the service accepts. */
export declare enum KnownCreatedByType {
    /** User */
    User = "User",
    /** Application */
    Application = "Application",
    /** ManagedIdentity */
    ManagedIdentity = "ManagedIdentity",
    /** Key */
    Key = "Key"
}
/**
 * Defines values for CreatedByType. \
 * {@link KnownCreatedByType} can be used interchangeably with CreatedByType,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **User** \
 * **Application** \
 * **ManagedIdentity** \
 * **Key**
 */
export type CreatedByType = string;
/** Known values of {@link DataProductUserRole} that the service accepts. */
export declare enum KnownDataProductUserRole {
    /** Field to specify user of type Reader. */
    Reader = "Reader",
    /**
     * Field to specify user of type SensitiveReader.
     * This user has privileged access to read sensitive data of a data product.
     */
    SensitiveReader = "SensitiveReader"
}
/**
 * Defines values for DataProductUserRole. \
 * {@link KnownDataProductUserRole} can be used interchangeably with DataProductUserRole,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Reader**: Field to specify user of type Reader. \
 * **SensitiveReader**: Field to specify user of type SensitiveReader.
 * This user has privileged access to read sensitive data of a data product.
 */
export type DataProductUserRole = string;
/** Known values of {@link DataTypeState} that the service accepts. */
export declare enum KnownDataTypeState {
    /** Field to specify stopped state. */
    Stopped = "Stopped",
    /** Field to specify running state. */
    Running = "Running"
}
/**
 * Defines values for DataTypeState. \
 * {@link KnownDataTypeState} can be used interchangeably with DataTypeState,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **Stopped**: Field to specify stopped state. \
 * **Running**: Field to specify running state.
 */
export type DataTypeState = string;
/** Known values of {@link Bypass} that the service accepts. */
export declare enum KnownBypass {
    /** Represents no bypassing of traffic. */
    None = "None",
    /** Represents bypassing logging traffic. */
    Logging = "Logging",
    /** Represents bypassing metrics traffic. */
    Metrics = "Metrics",
    /** Represents bypassing azure services traffic. */
    AzureServices = "AzureServices"
}
/**
 * Defines values for Bypass. \
 * {@link KnownBypass} can be used interchangeably with Bypass,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **None**: Represents no bypassing of traffic. \
 * **Logging**: Represents bypassing logging traffic. \
 * **Metrics**: Represents bypassing metrics traffic. \
 * **AzureServices**: Represents bypassing azure services traffic.
 */
export type Bypass = string;
/** Known values of {@link Versions} that the service accepts. */
export declare enum KnownVersions {
    /** The 2023-11-15 stable version. */
    V20231115 = "2023-11-15"
}
/**
 * Defines values for Versions. \
 * {@link KnownVersions} can be used interchangeably with Versions,
 *  this enum contains the known values that the service supports.
 * ### Known values supported by the service
 * **2023-11-15**: The 2023-11-15 stable version.
 */
export type Versions = string;
/** Optional parameters. */
export interface OperationsListOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the list operation. */
export type OperationsListResponse = OperationListResult;
/** Optional parameters. */
export interface OperationsListNextOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the listNext operation. */
export type OperationsListNextResponse = OperationListResult;
/** Optional parameters. */
export interface DataProductsListBySubscriptionOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the listBySubscription operation. */
export type DataProductsListBySubscriptionResponse = DataProductListResult;
/** Optional parameters. */
export interface DataProductsListByResourceGroupOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the listByResourceGroup operation. */
export type DataProductsListByResourceGroupResponse = DataProductListResult;
/** Optional parameters. */
export interface DataProductsGetOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the get operation. */
export type DataProductsGetResponse = DataProduct;
/** Optional parameters. */
export interface DataProductsCreateOptionalParams extends coreClient.OperationOptions {
    /** Delay to wait until next poll, in milliseconds. */
    updateIntervalInMs?: number;
    /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
    resumeFrom?: string;
}
/** Contains response data for the create operation. */
export type DataProductsCreateResponse = DataProduct;
/** Optional parameters. */
export interface DataProductsUpdateOptionalParams extends coreClient.OperationOptions {
    /** Delay to wait until next poll, in milliseconds. */
    updateIntervalInMs?: number;
    /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
    resumeFrom?: string;
}
/** Contains response data for the update operation. */
export type DataProductsUpdateResponse = DataProduct;
/** Optional parameters. */
export interface DataProductsDeleteOptionalParams extends coreClient.OperationOptions {
    /** Delay to wait until next poll, in milliseconds. */
    updateIntervalInMs?: number;
    /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
    resumeFrom?: string;
}
/** Contains response data for the delete operation. */
export type DataProductsDeleteResponse = DataProductsDeleteHeaders;
/** Optional parameters. */
export interface DataProductsAddUserRoleOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the addUserRole operation. */
export type DataProductsAddUserRoleResponse = RoleAssignmentDetail;
/** Optional parameters. */
export interface DataProductsGenerateStorageAccountSasTokenOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the generateStorageAccountSasToken operation. */
export type DataProductsGenerateStorageAccountSasTokenResponse = AccountSasToken;
/** Optional parameters. */
export interface DataProductsListRolesAssignmentsOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the listRolesAssignments operation. */
export type DataProductsListRolesAssignmentsResponse = ListRoleAssignments;
/** Optional parameters. */
export interface DataProductsRemoveUserRoleOptionalParams extends coreClient.OperationOptions {
}
/** Optional parameters. */
export interface DataProductsRotateKeyOptionalParams extends coreClient.OperationOptions {
}
/** Optional parameters. */
export interface DataProductsListBySubscriptionNextOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the listBySubscriptionNext operation. */
export type DataProductsListBySubscriptionNextResponse = DataProductListResult;
/** Optional parameters. */
export interface DataProductsListByResourceGroupNextOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the listByResourceGroupNext operation. */
export type DataProductsListByResourceGroupNextResponse = DataProductListResult;
/** Optional parameters. */
export interface DataProductsCatalogsListBySubscriptionOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the listBySubscription operation. */
export type DataProductsCatalogsListBySubscriptionResponse = DataProductsCatalogListResult;
/** Optional parameters. */
export interface DataProductsCatalogsListByResourceGroupOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the listByResourceGroup operation. */
export type DataProductsCatalogsListByResourceGroupResponse = DataProductsCatalogListResult;
/** Optional parameters. */
export interface DataProductsCatalogsGetOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the get operation. */
export type DataProductsCatalogsGetResponse = DataProductsCatalog;
/** Optional parameters. */
export interface DataProductsCatalogsListBySubscriptionNextOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the listBySubscriptionNext operation. */
export type DataProductsCatalogsListBySubscriptionNextResponse = DataProductsCatalogListResult;
/** Optional parameters. */
export interface DataProductsCatalogsListByResourceGroupNextOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the listByResourceGroupNext operation. */
export type DataProductsCatalogsListByResourceGroupNextResponse = DataProductsCatalogListResult;
/** Optional parameters. */
export interface DataTypesListByDataProductOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the listByDataProduct operation. */
export type DataTypesListByDataProductResponse = DataTypeListResult;
/** Optional parameters. */
export interface DataTypesGetOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the get operation. */
export type DataTypesGetResponse = DataType;
/** Optional parameters. */
export interface DataTypesCreateOptionalParams extends coreClient.OperationOptions {
    /** Delay to wait until next poll, in milliseconds. */
    updateIntervalInMs?: number;
    /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
    resumeFrom?: string;
}
/** Contains response data for the create operation. */
export type DataTypesCreateResponse = DataType;
/** Optional parameters. */
export interface DataTypesUpdateOptionalParams extends coreClient.OperationOptions {
    /** Delay to wait until next poll, in milliseconds. */
    updateIntervalInMs?: number;
    /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
    resumeFrom?: string;
}
/** Contains response data for the update operation. */
export type DataTypesUpdateResponse = DataType;
/** Optional parameters. */
export interface DataTypesDeleteOptionalParams extends coreClient.OperationOptions {
    /** Delay to wait until next poll, in milliseconds. */
    updateIntervalInMs?: number;
    /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
    resumeFrom?: string;
}
/** Contains response data for the delete operation. */
export type DataTypesDeleteResponse = DataTypesDeleteHeaders;
/** Optional parameters. */
export interface DataTypesDeleteDataOptionalParams extends coreClient.OperationOptions {
    /** Delay to wait until next poll, in milliseconds. */
    updateIntervalInMs?: number;
    /** A serialized poller which can be used to resume an existing paused Long-Running-Operation. */
    resumeFrom?: string;
}
/** Contains response data for the deleteData operation. */
export type DataTypesDeleteDataResponse = DataTypesDeleteDataHeaders;
/** Optional parameters. */
export interface DataTypesGenerateStorageContainerSasTokenOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the generateStorageContainerSasToken operation. */
export type DataTypesGenerateStorageContainerSasTokenResponse = ContainerSasToken;
/** Optional parameters. */
export interface DataTypesListByDataProductNextOptionalParams extends coreClient.OperationOptions {
}
/** Contains response data for the listByDataProductNext operation. */
export type DataTypesListByDataProductNextResponse = DataTypeListResult;
/** Optional parameters. */
export interface MicrosoftNetworkAnalyticsOptionalParams extends coreClient.ServiceClientOptions {
    /** server parameter */
    $host?: string;
    /** Api Version */
    apiVersion?: string;
    /** Overrides client endpoint. */
    endpoint?: string;
}
//# sourceMappingURL=index.d.ts.map