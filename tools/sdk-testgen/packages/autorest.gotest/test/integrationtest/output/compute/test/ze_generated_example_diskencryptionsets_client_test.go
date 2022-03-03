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

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
)

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2020-12-01/examples/CreateADiskEncryptionSetWithKeyVaultFromADifferentSubscription.json
func ExampleDiskEncryptionSetsClient_BeginCreateOrUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewDiskEncryptionSetsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginCreateOrUpdate(ctx,
		"<resource-group-name>",
		"<disk-encryption-set-name>",
		test.DiskEncryptionSet{
			Location: to.StringPtr("<location>"),
			Identity: &test.EncryptionSetIdentity{
				Type: test.DiskEncryptionSetIdentityTypeSystemAssigned.ToPtr(),
			},
			Properties: &test.EncryptionSetProperties{
				ActiveKey: &test.KeyForDiskEncryptionSet{
					KeyURL: to.StringPtr("<key-url>"),
				},
				EncryptionType: test.DiskEncryptionSetTypeEncryptionAtRestWithCustomerKey.ToPtr(),
			},
		},
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
		return
	}
	res, err := poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatalf("failed to pull the result: %v", err)
		return
	}
	// TODO: use response item
	_ = res.DiskEncryptionSetsClientCreateOrUpdateResult
}

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2020-12-01/examples/UpdateADiskEncryptionSetWithRotationToLatestKeyVersionEnabled.json
func ExampleDiskEncryptionSetsClient_BeginUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewDiskEncryptionSetsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginUpdate(ctx,
		"<resource-group-name>",
		"<disk-encryption-set-name>",
		test.DiskEncryptionSetUpdate{
			Identity: &test.EncryptionSetIdentity{
				Type: test.DiskEncryptionSetIdentityTypeSystemAssigned.ToPtr(),
			},
			Properties: &test.DiskEncryptionSetUpdateProperties{
				ActiveKey: &test.KeyForDiskEncryptionSet{
					KeyURL: to.StringPtr("<key-url>"),
				},
				EncryptionType:                    test.DiskEncryptionSetTypeEncryptionAtRestWithCustomerKey.ToPtr(),
				RotationToLatestKeyVersionEnabled: to.BoolPtr(true),
			},
		},
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
		return
	}
	res, err := poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatalf("failed to pull the result: %v", err)
		return
	}
	// TODO: use response item
	_ = res.DiskEncryptionSetsClientUpdateResult
}

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2020-12-01/examples/GetInformationAboutADiskEncryptionSet.json
func ExampleDiskEncryptionSetsClient_Get() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewDiskEncryptionSetsClient("<subscription-id>", cred, nil)
	res, err := client.Get(ctx,
		"<resource-group-name>",
		"<disk-encryption-set-name>",
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
		return
	}
	// TODO: use response item
	_ = res.DiskEncryptionSetsClientGetResult
}

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2020-12-01/examples/DeleteADiskEncryptionSet.json
func ExampleDiskEncryptionSetsClient_BeginDelete() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewDiskEncryptionSetsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginDelete(ctx,
		"<resource-group-name>",
		"<disk-encryption-set-name>",
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

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2020-12-01/examples/ListDiskEncryptionSetsInAResourceGroup.json
func ExampleDiskEncryptionSetsClient_ListByResourceGroup() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewDiskEncryptionSetsClient("<subscription-id>", cred, nil)
	pager := client.ListByResourceGroup("<resource-group-name>",
		nil)
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

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2020-12-01/examples/ListDiskEncryptionSetsInASubscription.json
func ExampleDiskEncryptionSetsClient_List() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewDiskEncryptionSetsClient("<subscription-id>", cred, nil)
	pager := client.List(nil)
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

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2020-12-01/examples/ListDiskEncryptionSetAssociatedResources.json
func ExampleDiskEncryptionSetsClient_ListAssociatedResources() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewDiskEncryptionSetsClient("<subscription-id>", cred, nil)
	pager := client.ListAssociatedResources("<resource-group-name>",
		"<disk-encryption-set-name>",
		nil)
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
