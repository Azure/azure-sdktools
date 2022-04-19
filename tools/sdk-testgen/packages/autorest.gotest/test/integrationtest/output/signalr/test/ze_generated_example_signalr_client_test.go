//go:build go1.18
// +build go1.18

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.
// Code generated by Microsoft (R) AutoRest Code Generator.
// Changes may cause incorrect behavior and will be lost if the code is regenerated.

package test_test

import (
	"context"
	"log"

	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
)

// Generated from example definition: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/signalr/resource-manager/Microsoft.SignalRService/preview/2021-06-01-preview/examples/SignalR_CheckNameAvailability.json
func ExampleSignalRClient_CheckNameAvailability() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client, err := test.NewSignalRClient("<subscription-id>", cred, nil)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	res, err := client.CheckNameAvailability(ctx,
		"<location>",
		test.NameAvailabilityParameters{
			Name: to.Ptr("<name>"),
			Type: to.Ptr("<type>"),
		},
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
	}
	// TODO: use response item
	_ = res
}

// Generated from example definition: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/signalr/resource-manager/Microsoft.SignalRService/preview/2021-06-01-preview/examples/SignalR_ListBySubscription.json
func ExampleSignalRClient_NewListBySubscriptionPager() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client, err := test.NewSignalRClient("<subscription-id>", cred, nil)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	pager := client.NewListBySubscriptionPager(nil)
	for pager.More() {
		nextResult, err := pager.NextPage(ctx)
		if err != nil {
			log.Fatalf("failed to advance page: %v", err)
		}
		for _, v := range nextResult.Value {
			// TODO: use page item
			_ = v
		}
	}
}

// Generated from example definition: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/signalr/resource-manager/Microsoft.SignalRService/preview/2021-06-01-preview/examples/SignalR_ListByResourceGroup.json
func ExampleSignalRClient_NewListByResourceGroupPager() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client, err := test.NewSignalRClient("<subscription-id>", cred, nil)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	pager := client.NewListByResourceGroupPager("<resource-group-name>",
		nil)
	for pager.More() {
		nextResult, err := pager.NextPage(ctx)
		if err != nil {
			log.Fatalf("failed to advance page: %v", err)
		}
		for _, v := range nextResult.Value {
			// TODO: use page item
			_ = v
		}
	}
}

// Generated from example definition: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/signalr/resource-manager/Microsoft.SignalRService/preview/2021-06-01-preview/examples/SignalR_Get.json
func ExampleSignalRClient_Get() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client, err := test.NewSignalRClient("<subscription-id>", cred, nil)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	res, err := client.Get(ctx,
		"<resource-group-name>",
		"<resource-name>",
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
	}
	// TODO: use response item
	_ = res
}

// Generated from example definition: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/signalr/resource-manager/Microsoft.SignalRService/preview/2021-06-01-preview/examples/SignalR_CreateOrUpdate.json
func ExampleSignalRClient_BeginCreateOrUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client, err := test.NewSignalRClient("<subscription-id>", cred, nil)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	poller, err := client.BeginCreateOrUpdate(ctx,
		"<resource-group-name>",
		"<resource-name>",
		test.ResourceInfo{
			Location: to.Ptr("<location>"),
			Tags: map[string]*string{
				"key1": to.Ptr("value1"),
			},
			Identity: &test.ManagedIdentity{
				Type: to.Ptr(test.ManagedIdentityTypeSystemAssigned),
			},
			Kind: to.Ptr(test.ServiceKindSignalR),
			Properties: &test.SignalRProperties{
				Cors: &test.SignalRCorsSettings{
					AllowedOrigins: []*string{
						to.Ptr("https://foo.com"),
						to.Ptr("https://bar.com")},
				},
				DisableAADAuth:   to.Ptr(false),
				DisableLocalAuth: to.Ptr(false),
				Features: []*test.SignalRFeature{
					{
						Flag:       to.Ptr(test.FeatureFlagsServiceMode),
						Properties: map[string]*string{},
						Value:      to.Ptr("<value>"),
					},
					{
						Flag:       to.Ptr(test.FeatureFlagsEnableConnectivityLogs),
						Properties: map[string]*string{},
						Value:      to.Ptr("<value>"),
					},
					{
						Flag:       to.Ptr(test.FeatureFlagsEnableMessagingLogs),
						Properties: map[string]*string{},
						Value:      to.Ptr("<value>"),
					},
					{
						Flag:       to.Ptr(test.FeatureFlagsEnableLiveTrace),
						Properties: map[string]*string{},
						Value:      to.Ptr("<value>"),
					}},
				NetworkACLs: &test.SignalRNetworkACLs{
					DefaultAction: to.Ptr(test.ACLActionDeny),
					PrivateEndpoints: []*test.PrivateEndpointACL{
						{
							Allow: []*test.SignalRRequestType{
								to.Ptr(test.SignalRRequestTypeServerConnection)},
							Name: to.Ptr("<name>"),
						}},
					PublicNetwork: &test.NetworkACL{
						Allow: []*test.SignalRRequestType{
							to.Ptr(test.SignalRRequestTypeClientConnection)},
					},
				},
				PublicNetworkAccess: to.Ptr("<public-network-access>"),
				TLS: &test.SignalRTLSSettings{
					ClientCertEnabled: to.Ptr(false),
				},
				Upstream: &test.ServerlessUpstreamSettings{
					Templates: []*test.UpstreamTemplate{
						{
							Auth: &test.UpstreamAuthSettings{
								Type: to.Ptr(test.UpstreamAuthTypeManagedIdentity),
								ManagedIdentity: &test.ManagedIdentitySettings{
									Resource: to.Ptr("<resource>"),
								},
							},
							CategoryPattern: to.Ptr("<category-pattern>"),
							EventPattern:    to.Ptr("<event-pattern>"),
							HubPattern:      to.Ptr("<hub-pattern>"),
							URLTemplate:     to.Ptr("<urltemplate>"),
						}},
				},
			},
			SKU: &test.ResourceSKU{
				Name:     to.Ptr("<name>"),
				Capacity: to.Ptr[int32](1),
				Tier:     to.Ptr(test.SignalRSKUTierStandard),
			},
		},
		&test.SignalRClientBeginCreateOrUpdateOptions{ResumeToken: ""})
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
	}
	res, err := poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatalf("failed to pull the result: %v", err)
	}
	// TODO: use response item
	_ = res
}

// Generated from example definition: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/signalr/resource-manager/Microsoft.SignalRService/preview/2021-06-01-preview/examples/SignalR_Delete.json
func ExampleSignalRClient_BeginDelete() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client, err := test.NewSignalRClient("<subscription-id>", cred, nil)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	poller, err := client.BeginDelete(ctx,
		"<resource-group-name>",
		"<resource-name>",
		&test.SignalRClientBeginDeleteOptions{ResumeToken: ""})
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatalf("failed to pull the result: %v", err)
	}
}

// Generated from example definition: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/signalr/resource-manager/Microsoft.SignalRService/preview/2021-06-01-preview/examples/SignalR_Update.json
func ExampleSignalRClient_BeginUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client, err := test.NewSignalRClient("<subscription-id>", cred, nil)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	poller, err := client.BeginUpdate(ctx,
		"<resource-group-name>",
		"<resource-name>",
		test.ResourceInfo{
			Location: to.Ptr("<location>"),
			Tags: map[string]*string{
				"key1": to.Ptr("value1"),
			},
			Identity: &test.ManagedIdentity{
				Type: to.Ptr(test.ManagedIdentityTypeSystemAssigned),
			},
			Kind: to.Ptr(test.ServiceKindSignalR),
			Properties: &test.SignalRProperties{
				Cors: &test.SignalRCorsSettings{
					AllowedOrigins: []*string{
						to.Ptr("https://foo.com"),
						to.Ptr("https://bar.com")},
				},
				DisableAADAuth:   to.Ptr(false),
				DisableLocalAuth: to.Ptr(false),
				Features: []*test.SignalRFeature{
					{
						Flag:       to.Ptr(test.FeatureFlagsServiceMode),
						Properties: map[string]*string{},
						Value:      to.Ptr("<value>"),
					},
					{
						Flag:       to.Ptr(test.FeatureFlagsEnableConnectivityLogs),
						Properties: map[string]*string{},
						Value:      to.Ptr("<value>"),
					},
					{
						Flag:       to.Ptr(test.FeatureFlagsEnableMessagingLogs),
						Properties: map[string]*string{},
						Value:      to.Ptr("<value>"),
					},
					{
						Flag:       to.Ptr(test.FeatureFlagsEnableLiveTrace),
						Properties: map[string]*string{},
						Value:      to.Ptr("<value>"),
					}},
				NetworkACLs: &test.SignalRNetworkACLs{
					DefaultAction: to.Ptr(test.ACLActionDeny),
					PrivateEndpoints: []*test.PrivateEndpointACL{
						{
							Allow: []*test.SignalRRequestType{
								to.Ptr(test.SignalRRequestTypeServerConnection)},
							Name: to.Ptr("<name>"),
						}},
					PublicNetwork: &test.NetworkACL{
						Allow: []*test.SignalRRequestType{
							to.Ptr(test.SignalRRequestTypeClientConnection)},
					},
				},
				PublicNetworkAccess: to.Ptr("<public-network-access>"),
				TLS: &test.SignalRTLSSettings{
					ClientCertEnabled: to.Ptr(false),
				},
				Upstream: &test.ServerlessUpstreamSettings{
					Templates: []*test.UpstreamTemplate{
						{
							Auth: &test.UpstreamAuthSettings{
								Type: to.Ptr(test.UpstreamAuthTypeManagedIdentity),
								ManagedIdentity: &test.ManagedIdentitySettings{
									Resource: to.Ptr("<resource>"),
								},
							},
							CategoryPattern: to.Ptr("<category-pattern>"),
							EventPattern:    to.Ptr("<event-pattern>"),
							HubPattern:      to.Ptr("<hub-pattern>"),
							URLTemplate:     to.Ptr("<urltemplate>"),
						}},
				},
			},
			SKU: &test.ResourceSKU{
				Name:     to.Ptr("<name>"),
				Capacity: to.Ptr[int32](1),
				Tier:     to.Ptr(test.SignalRSKUTierStandard),
			},
		},
		&test.SignalRClientBeginUpdateOptions{ResumeToken: ""})
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
	}
	res, err := poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatalf("failed to pull the result: %v", err)
	}
	// TODO: use response item
	_ = res
}

// Generated from example definition: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/signalr/resource-manager/Microsoft.SignalRService/preview/2021-06-01-preview/examples/SignalR_ListKeys.json
func ExampleSignalRClient_ListKeys() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client, err := test.NewSignalRClient("<subscription-id>", cred, nil)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	res, err := client.ListKeys(ctx,
		"<resource-group-name>",
		"<resource-name>",
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
	}
	// TODO: use response item
	_ = res
}

// Generated from example definition: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/signalr/resource-manager/Microsoft.SignalRService/preview/2021-06-01-preview/examples/SignalR_RegenerateKey.json
func ExampleSignalRClient_BeginRegenerateKey() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client, err := test.NewSignalRClient("<subscription-id>", cred, nil)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	poller, err := client.BeginRegenerateKey(ctx,
		"<resource-group-name>",
		"<resource-name>",
		test.RegenerateKeyParameters{
			KeyType: to.Ptr(test.KeyTypePrimary),
		},
		&test.SignalRClientBeginRegenerateKeyOptions{ResumeToken: ""})
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatalf("failed to pull the result: %v", err)
	}
}

// Generated from example definition: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/signalr/resource-manager/Microsoft.SignalRService/preview/2021-06-01-preview/examples/SignalR_Restart.json
func ExampleSignalRClient_BeginRestart() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client, err := test.NewSignalRClient("<subscription-id>", cred, nil)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	poller, err := client.BeginRestart(ctx,
		"<resource-group-name>",
		"<resource-name>",
		&test.SignalRClientBeginRestartOptions{ResumeToken: ""})
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatalf("failed to pull the result: %v", err)
	}
}
