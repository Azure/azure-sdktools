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

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
)

// Generated from example definition: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/signalr/resource-manager/Microsoft.SignalRService/preview/2021-06-01-preview/examples/SignalRPrivateEndpointConnections_List.json
func ExampleSignalRPrivateEndpointConnectionsClient_NewListPager() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client, err := test.NewSignalRPrivateEndpointConnectionsClient("00000000-0000-0000-0000-000000000000", cred, nil)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	pager := client.NewListPager("myResourceGroup",
		"mySignalRService",
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

// Generated from example definition: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/signalr/resource-manager/Microsoft.SignalRService/preview/2021-06-01-preview/examples/SignalRPrivateEndpointConnections_Get.json
func ExampleSignalRPrivateEndpointConnectionsClient_Get() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client, err := test.NewSignalRPrivateEndpointConnectionsClient("00000000-0000-0000-0000-000000000000", cred, nil)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	res, err := client.Get(ctx,
		"mysignalrservice.1fa229cd-bf3f-47f0-8c49-afb36723997e",
		"myResourceGroup",
		"mySignalRService",
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
	}
	// TODO: use response item
	_ = res
}

// Generated from example definition: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/signalr/resource-manager/Microsoft.SignalRService/preview/2021-06-01-preview/examples/SignalRPrivateEndpointConnections_Update.json
func ExampleSignalRPrivateEndpointConnectionsClient_Update() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client, err := test.NewSignalRPrivateEndpointConnectionsClient("00000000-0000-0000-0000-000000000000", cred, nil)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	res, err := client.Update(ctx,
		"mysignalrservice.1fa229cd-bf3f-47f0-8c49-afb36723997e",
		"myResourceGroup",
		"mySignalRService",
		test.PrivateEndpointConnection{
			Properties: &test.PrivateEndpointConnectionProperties{
				PrivateEndpoint: &test.PrivateEndpoint{
					ID: to.Ptr("/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/myResourceGroup/providers/Microsoft.Network/privateEndpoints/myPrivateEndpoint"),
				},
				PrivateLinkServiceConnectionState: &test.PrivateLinkServiceConnectionState{
					ActionsRequired: to.Ptr("None"),
					Status:          to.Ptr(test.PrivateLinkServiceConnectionStatusApproved),
				},
			},
		},
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
	}
	// TODO: use response item
	_ = res
}

// Generated from example definition: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/signalr/resource-manager/Microsoft.SignalRService/preview/2021-06-01-preview/examples/SignalRPrivateEndpointConnections_Delete.json
func ExampleSignalRPrivateEndpointConnectionsClient_BeginDelete() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client, err := test.NewSignalRPrivateEndpointConnectionsClient("00000000-0000-0000-0000-000000000000", cred, nil)
	if err != nil {
		log.Fatalf("failed to create client: %v", err)
	}
	poller, err := client.BeginDelete(ctx,
		"mysignalrservice.1fa229cd-bf3f-47f0-8c49-afb36723997e",
		"myResourceGroup",
		"mySignalRService",
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
	}
	_, err = poller.PollUntilDone(ctx, nil)
	if err != nil {
		log.Fatalf("failed to pull the result: %v", err)
	}
}
