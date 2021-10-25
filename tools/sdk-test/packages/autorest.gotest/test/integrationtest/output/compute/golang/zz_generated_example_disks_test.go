//go:build go1.16
// +build go1.16

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.
// Code generated by Microsoft (R) AutoRest Code Generator.
// Changes may cause incorrect behavior and will be lost if the code is regenerated.

package golang_test

import (
	"context"
	"log"

	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/arm"
	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
)

func ExampleDisksClient_BeginCreateOrUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	con := arm.NewDefaultConnection(cred, nil)
	ctx := context.Background()
	client := golang.NewDisksClient(con,
		"<subscription-id>")
	poller, err := client.BeginCreateOrUpdate(ctx,
		"<resource-group-name>",
		"<disk-name>",
		golang.Disk{
			Resource: golang.Resource{
				Location: to.StringPtr("<location>"),
			},
			Properties: &golang.DiskProperties{
				CreationData: &golang.CreationData{
					CreateOption: golang.DiskCreateOptionEmpty.ToPtr(),
				},
				DiskAccessID:        to.StringPtr("<disk-access-id>"),
				DiskSizeGB:          to.Int32Ptr(200),
				NetworkAccessPolicy: golang.NetworkAccessPolicyAllowPrivate.ToPtr(),
			},
		},
		nil)
	if err != nil {
		log.Fatal(err)
	}
	res, err := poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Disk.ID: %s\n", *res.ID)
}

func ExampleDisksClient_BeginUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	con := arm.NewDefaultConnection(cred, nil)
	ctx := context.Background()
	client := golang.NewDisksClient(con,
		"<subscription-id>")
	poller, err := client.BeginUpdate(ctx,
		"<resource-group-name>",
		"<disk-name>",
		golang.DiskUpdate{
			Properties: &golang.DiskUpdateProperties{
				BurstingEnabled: to.BoolPtr(true),
				DiskSizeGB:      to.Int32Ptr(1024),
			},
		},
		nil)
	if err != nil {
		log.Fatal(err)
	}
	res, err := poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Disk.ID: %s\n", *res.ID)
}

func ExampleDisksClient_Get() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	con := arm.NewDefaultConnection(cred, nil)
	ctx := context.Background()
	client := golang.NewDisksClient(con,
		"<subscription-id>")
	res, err := client.Get(ctx,
		"<resource-group-name>",
		"<disk-name>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Disk.ID: %s\n", *res.ID)
}

func ExampleDisksClient_ListByResourceGroup() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	con := arm.NewDefaultConnection(cred, nil)
	ctx := context.Background()
	client := golang.NewDisksClient(con,
		"<subscription-id>")
	pager := client.ListByResourceGroup("<resource-group-name>",
		nil)
	for pager.NextPage(ctx) {
		if err := pager.Err(); err != nil {
			log.Fatalf("failed to advance page: %v", err)
		}
		for _, v := range pager.PageResponse().Value {
			log.Printf("Disk.ID: %s\n", *v.ID)
		}
	}
}

func ExampleDisksClient_List() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	con := arm.NewDefaultConnection(cred, nil)
	ctx := context.Background()
	client := golang.NewDisksClient(con,
		"<subscription-id>")
	pager := client.List(nil)
	for pager.NextPage(ctx) {
		if err := pager.Err(); err != nil {
			log.Fatalf("failed to advance page: %v", err)
		}
		for _, v := range pager.PageResponse().Value {
			log.Printf("Disk.ID: %s\n", *v.ID)
		}
	}
}
