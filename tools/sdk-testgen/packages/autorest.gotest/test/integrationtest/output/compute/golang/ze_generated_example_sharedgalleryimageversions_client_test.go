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

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
)

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2020-09-30/examples/ListSharedGalleryImageVersions.json
func ExampleSharedGalleryImageVersionsClient_List() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewSharedGalleryImageVersionsClient("<subscription-id>", cred, nil)
	pager := client.List("<location>",
		"<gallery-unique-name>",
		"<gallery-image-name>",
		&golang.SharedGalleryImageVersionsListOptions{SharedTo: nil})
	for {
		nextResult := pager.NextPage(ctx)
		if err := pager.Err(); err != nil {
			log.Fatalf("failed to advance page: %v", err)
		}
		if !nextResult {
			break
		}
		for _, v := range pager.PageResponse().Value {
			log.Printf("Pager result: %#v\n", v)
		}
	}
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2020-09-30/examples/GetASharedGalleryImageVersion.json
func ExampleSharedGalleryImageVersionsClient_Get() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewSharedGalleryImageVersionsClient("<subscription-id>", cred, nil)
	res, err := client.Get(ctx,
		"<location>",
		"<gallery-unique-name>",
		"<gallery-image-name>",
		"<gallery-image-version-name>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Response result: %#v\n", res.SharedGalleryImageVersionsGetResult)
}
