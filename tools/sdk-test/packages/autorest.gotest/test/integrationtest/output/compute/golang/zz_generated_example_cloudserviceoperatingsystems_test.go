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

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/arm"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
)

func ExampleCloudServiceOperatingSystemsClient_GetOSVersion() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	con := arm.NewDefaultConnection(cred, nil)
	ctx := context.Background()
	client := golang.NewCloudServiceOperatingSystemsClient(con,
		"<subscription-id>")
	res, err := client.GetOSVersion(ctx,
		"<location>",
		"<os-version-name>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("OSVersion.ID: %s\n", *res.ID)
}

func ExampleCloudServiceOperatingSystemsClient_ListOSVersions() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	con := arm.NewDefaultConnection(cred, nil)
	ctx := context.Background()
	client := golang.NewCloudServiceOperatingSystemsClient(con,
		"<subscription-id>")
	pager := client.ListOSVersions("<location>",
		nil)
	for pager.NextPage(ctx) {
		if err := pager.Err(); err != nil {
			log.Fatalf("failed to advance page: %v", err)
		}
		for _, v := range pager.PageResponse().Value {
			log.Printf("OSVersion.ID: %s\n", *v.ID)
		}
	}
}

func ExampleCloudServiceOperatingSystemsClient_GetOSFamily() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	con := arm.NewDefaultConnection(cred, nil)
	ctx := context.Background()
	client := golang.NewCloudServiceOperatingSystemsClient(con,
		"<subscription-id>")
	res, err := client.GetOSFamily(ctx,
		"<location>",
		"<os-family-name>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("OSFamily.ID: %s\n", *res.ID)
}

func ExampleCloudServiceOperatingSystemsClient_ListOSFamilies() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	con := arm.NewDefaultConnection(cred, nil)
	ctx := context.Background()
	client := golang.NewCloudServiceOperatingSystemsClient(con,
		"<subscription-id>")
	pager := client.ListOSFamilies("<location>",
		nil)
	for pager.NextPage(ctx) {
		if err := pager.Err(); err != nil {
			log.Fatalf("failed to advance page: %v", err)
		}
		for _, v := range pager.PageResponse().Value {
			log.Printf("OSFamily.ID: %s\n", *v.ID)
		}
	}
}
