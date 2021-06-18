targetScope = 'subscription'

param groupSuffix string
param clusterName string
param clusterLocation string = 'westus2'
param monitoringLocation string = 'centralus'
param tags object
param enableMonitoring bool = false

resource group 'Microsoft.Resources/resourceGroups@2020-10-01' = {
    name: 'rg-stress-test-cluster-${groupSuffix}'
    location: clusterLocation
    tags: tags
}

// Add unique suffix to monitoring resource names to simplify cross-resource queries.
// https://docs.microsoft.com/en-us/azure/azure-monitor/logs/cross-workspace-query#identifying-an-application
var resourceSuffix = uniqueString(group.id)

module logWorkspace 'monitoring/log-analytics-workspace.bicep' = if (enableMonitoring) {
    name: 'logs'
    scope: group
    params: {
        workspaceName: '${clusterName}-logs-${resourceSuffix}'
        location: monitoringLocation
    }
}

module appInsights 'monitoring/app-insights.bicep' = if (enableMonitoring) {
    name: 'appInsights'
    scope: group
    params: {
        name: '${clusterName}-ai-${resourceSuffix}'
        location: monitoringLocation
        workspaceId: logWorkspace.outputs.id
    }
}

module cluster 'cluster/cluster.bicep' = {
    name: 'cluster'
    scope: group
    params: {
        clusterName: clusterName
        tags: tags
        groupSuffix: groupSuffix
        enableMonitoring: enableMonitoring
        workspaceId: enableMonitoring ? logWorkspace.outputs.id : ''
    }
}

module keyvault 'cluster/keyvault.bicep' = if (enableMonitoring) {
    name: 'keyvault'
    scope: group
    params: {
        keyVaultName: '${clusterName}-kv-${resourceSuffix}'
        location: clusterLocation
        tags: tags
        secretsObject: {
            secrets: [
                {
                    secretName: 'appInsightsInstrumentationKey-${resourceSuffix}'
                    secretValue: appInsights.outputs.instrumentationKey
                }
            ]
        }
    }
}
