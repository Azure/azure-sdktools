param location string = 'westus2'
param storageAccountName string = 'azsdkengsyspipelinelogs'
param eventgridTopicName string = 'azsdkengsyspipelinelogs-53d9a67c-c733-4988-b9af-db8a0db1434c'
param eventHubNamespaceName string = 'ADX-EG-azsdkengsys'
param kustoClusterName string = 'azsdkengsys'
param kustoDatabaseName string = 'Pipelines'

var tables = [
  {
    name: 'Build'
    container: 'builds'
  }
  {
    name: 'BuildDefinition'
    container: 'builddefinitions'
  }
  {
    name: 'BuildFailure'
    container: 'buildfailures'
  }
  {
    name: 'BuildLogLine'
    container: 'buildloglines'
  }
  {
    name: 'BuildTimelineRecord'
    container: 'buildtimelinerecords'
  }
  {
    name: 'PipelineOwners'
    container: 'pipelineowners'
  }
  {
    name: 'TestRun'
    container: 'testruns'
  }
]

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2021-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_RAGRS'
  }
  kind: 'StorageV2'
  properties: {
    defaultToOAuthAuthentication: false
    allowCrossTenantReplication: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: true
    allowSharedKeyAccess: true
    networkAcls: {
      bypass: 'AzureServices'
      virtualNetworkRules: []
      ipRules: []
      defaultAction: 'Allow'
    }
    supportsHttpsTrafficOnly: true
    encryption: {
      services: {
        file: {
          keyType: 'Account'
          enabled: true
        }
        blob: {
          keyType: 'Account'
          enabled: true
        }
      }
      keySource: 'Microsoft.Storage'
    }
    accessTier: 'Hot'
  }
  resource blobServices 'blobServices' = {
    name: 'default'
    properties: {
      changeFeed: {
        enabled: false
      }
      restorePolicy: {
        enabled: false
      }
      containerDeleteRetentionPolicy: {
        enabled: true
        days: 7
      }
      cors: {
        corsRules: []
      }
      deleteRetentionPolicy: {
        allowPermanentDelete: false
        enabled: true
        days: 7
      }
      isVersioningEnabled: false
    }
  }
}

// Event Grid
resource eventGridTopic 'Microsoft.EventGrid/systemTopics@2022-06-15' = {
  name: eventgridTopicName
  location: location
  properties: {
    source: storageAccount.id
    topicType: 'microsoft.storage.storageaccounts'
  }
}

// Event Hub
resource eventhubNamespace 'Microsoft.EventHub/namespaces@2022-01-01-preview' = {
  name: aventHubNamespaceName
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
    capacity: 1
  }
  properties: {
    minimumTlsVersion: '1.0'
    publicNetworkAccess: 'Enabled'
    disableLocalAuth: false
    zoneRedundant: false
    isAutoInflateEnabled: false
    maximumThroughputUnits: 0
    kafkaEnabled: true
  }
  resource ruleset 'networkRuleSets' = {
    name: 'default'
    properties: {
      publicNetworkAccess: 'Enabled'
      defaultAction: 'Allow'
      virtualNetworkRules: []
      ipRules: []
    }
  }
  resource authRules 'authorizationRules' = {
    name: 'RootManageSharedAccessKey'
    properties: {
      rights: [
        'Listen'
        'Manage'
        'Send'
      ]
    }
  }
}

// Kusto Cluster
resource kustoCluster 'Microsoft.Kusto/Clusters@2022-02-01' = {
  name: kustoClusterName
  location: location
  sku: {
    name: 'Standard_E2a_v4'
    tier: 'Standard'
    capacity: 3
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    trustedExternalTenants: []
    optimizedAutoscale: {
      version: 1
      isEnabled: true
      minimum: 2
      maximum: 3
    }
    enableDiskEncryption: false
    enableStreamingIngest: false
    enablePurge: false
    enableDoubleEncryption: false
    engineType: 'V3'
    acceptedAudiences: []
    restrictOutboundNetworkAccess: 'Disabled'
    allowedFqdnList: []
    publicNetworkAccess: 'Enabled'
    allowedIpRangeList: []
    enableAutoStop: false
    publicIPType: 'IPv4'
  }
  resource database 'Databases' = {
    name: kustoDatabaseName
    kind: 'ReadWrite'
    properties: {
      hotCachePeriod: 'P31D'
    }
  }
}

// Resources per table
resource containers 'Microsoft.Storage/storageAccounts/blobServices/containers@2021-09-01' = [for table in tables: {
  parent: storageAccount::blobServices
  name: table.container
  properties: {
    immutableStorageWithVersioning: {
      enabled: false
    }
    defaultEncryptionScope: '$account-encryption-key'
    denyEncryptionScopeOverride: false
    publicAccess: 'None'
  }
}]

resource eventHubs 'Microsoft.EventHub/namespaces/eventhubs@2022-01-01-preview' = [for (table, i) in tables: {
  parent: eventhubNamespace
  name: '${table.name}Blobs'
  properties: {
    messageRetentionInDays: 7
    partitionCount: 8
    status: 'Active'
  }
}]

resource eventGridSubscriptions 'Microsoft.EventGrid/systemTopics/eventSubscriptions@2022-06-15' = [for (table, i) in tables: {
  parent: eventGridTopic
  name: '${table.name}Blobs'
  properties: {
    destination: {
      properties: {
        resourceId: eventHubs[i].id
      }
      endpointType: 'EventHub'
    }
    filter: {
      subjectBeginsWith: '/blobServices/default/containers/${table.container}'
      includedEventTypes: [
        'Microsoft.Storage.BlobCreated'
      ]
    }
    eventDeliverySchema: 'EventGridSchema'
    retryPolicy: {
      maxDeliveryAttempts: 30
      eventTimeToLiveInMinutes: 1440
    }
  }
}]

resource kustoDataConnections 'Microsoft.Kusto/Clusters/Databases/DataConnections@2022-02-01' = [for (table, i) in tables: {
  parent: kustoCluster::database
  name: '${table.name}Blobs'
  kind: 'EventGrid'
  properties: {
    ignoreFirstRecord: false
    storageAccountResourceId: storageAccount.id
    eventHubResourceId: eventHubs[i].id
    consumerGroup: '$Default'
    tableName: table.name
    mappingRuleName: '${table.name}_mapping'
    dataFormat: 'JSON'
    blobStorageEventType: 'Microsoft.Storage.BlobCreated'
    databaseRouting: 'Single'
  }
}]
