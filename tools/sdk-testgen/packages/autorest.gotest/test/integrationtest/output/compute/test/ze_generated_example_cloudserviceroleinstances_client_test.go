//go:build go1.16
// +build go1.16

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.
// Code generated by Microsoft (R) AutoRest Code Generator.
// Changes may cause incorrect behavior and will be lost if the code is regenerated.

package test_test

import (
	"context"
	"log"

	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
)

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/DeleteCloudServiceRoleInstance.json
func ExampleCloudServiceRoleInstancesClient_BeginDelete() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewCloudServiceRoleInstancesClient("<subscription-id>", cred, nil)
	poller, err := client.BeginDelete(ctx,
		"<role-instance-name>",
		"<resource-group-name>",
		"<cloud-service-name>",
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
		return
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatalf("failed to pull the result: %v", err)
		return
	}
}

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/GetCloudServiceRoleInstance.json
func ExampleCloudServiceRoleInstancesClient_Get() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewCloudServiceRoleInstancesClient("<subscription-id>", cred, nil)
	res, err := client.Get(ctx,
		"<role-instance-name>",
		"<resource-group-name>",
		"<cloud-service-name>",
		&test.CloudServiceRoleInstancesClientGetOptions{Expand: nil})
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
		return
	}
	// TODO: use response item
	_ = res.CloudServiceRoleInstancesClientGetResult
}

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/GetInstanceViewOfCloudServiceRoleInstance.json
func ExampleCloudServiceRoleInstancesClient_GetInstanceView() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewCloudServiceRoleInstancesClient("<subscription-id>", cred, nil)
	res, err := client.GetInstanceView(ctx,
		"<role-instance-name>",
		"<resource-group-name>",
		"<cloud-service-name>",
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
		return
	}
	// TODO: use response item
	_ = res.CloudServiceRoleInstancesClientGetInstanceViewResult
}

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/ListCloudServiceRolesInstances.json
func ExampleCloudServiceRoleInstancesClient_List() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewCloudServiceRoleInstancesClient("<subscription-id>", cred, nil)
	pager := client.List("<resource-group-name>",
		"<cloud-service-name>",
		&test.CloudServiceRoleInstancesClientListOptions{Expand: nil})
	for {
		nextResult := pager.NextPage(ctx)
		if err := pager.Err(); err != nil {
			log.Fatalf("failed to advance page: %v", err)
			return
		}
		if !nextResult {
			break
		}
		for _, v := range pager.PageResponse().Value {
			// TODO: use page item
			_ = v
		}
	}
}

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/RestartCloudServiceRoleInstance.json
func ExampleCloudServiceRoleInstancesClient_BeginRestart() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewCloudServiceRoleInstancesClient("<subscription-id>", cred, nil)
	poller, err := client.BeginRestart(ctx,
		"<role-instance-name>",
		"<resource-group-name>",
		"<cloud-service-name>",
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
		return
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatalf("failed to pull the result: %v", err)
		return
	}
}

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/ReimageCloudServiceRoleInstance.json
func ExampleCloudServiceRoleInstancesClient_BeginReimage() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewCloudServiceRoleInstancesClient("<subscription-id>", cred, nil)
	poller, err := client.BeginReimage(ctx,
		"<role-instance-name>",
		"<resource-group-name>",
		"<cloud-service-name>",
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
		return
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatalf("failed to pull the result: %v", err)
		return
	}
}

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/RebuildCloudServiceRoleInstance.json
func ExampleCloudServiceRoleInstancesClient_BeginRebuild() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewCloudServiceRoleInstancesClient("<subscription-id>", cred, nil)
	poller, err := client.BeginRebuild(ctx,
		"<role-instance-name>",
		"<resource-group-name>",
		"<cloud-service-name>",
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
		return
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatalf("failed to pull the result: %v", err)
		return
	}
}
