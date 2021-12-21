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

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
)

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2020-09-30/examples/CreateOrUpdateASimpleGalleryApplication.json
func ExampleGalleryApplicationsClient_BeginCreateOrUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewGalleryApplicationsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginCreateOrUpdate(ctx,
		"<resource-group-name>",
		"<gallery-name>",
		"<gallery-application-name>",
		golang.GalleryApplication{
			Location: to.StringPtr("<location>"),
			Properties: &golang.GalleryApplicationProperties{
				Description:         to.StringPtr("<description>"),
				Eula:                to.StringPtr("<eula>"),
				PrivacyStatementURI: to.StringPtr("<privacy-statement-uri>"),
				ReleaseNoteURI:      to.StringPtr("<release-note-uri>"),
				SupportedOSType:     golang.OperatingSystemTypesWindows.ToPtr(),
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
	log.Printf("Response result: %#v\n", res.GalleryApplicationsCreateOrUpdateResult)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2020-09-30/examples/UpdateASimpleGalleryApplication.json
func ExampleGalleryApplicationsClient_BeginUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewGalleryApplicationsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginUpdate(ctx,
		"<resource-group-name>",
		"<gallery-name>",
		"<gallery-application-name>",
		golang.GalleryApplicationUpdate{
			Properties: &golang.GalleryApplicationProperties{
				Description:         to.StringPtr("<description>"),
				Eula:                to.StringPtr("<eula>"),
				PrivacyStatementURI: to.StringPtr("<privacy-statement-uri>"),
				ReleaseNoteURI:      to.StringPtr("<release-note-uri>"),
				SupportedOSType:     golang.OperatingSystemTypesWindows.ToPtr(),
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
	log.Printf("Response result: %#v\n", res.GalleryApplicationsUpdateResult)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2020-09-30/examples/GetAGalleryApplication.json
func ExampleGalleryApplicationsClient_Get() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewGalleryApplicationsClient("<subscription-id>", cred, nil)
	res, err := client.Get(ctx,
		"<resource-group-name>",
		"<gallery-name>",
		"<gallery-application-name>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Response result: %#v\n", res.GalleryApplicationsGetResult)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2020-09-30/examples/DeleteAGalleryApplication.json
func ExampleGalleryApplicationsClient_BeginDelete() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewGalleryApplicationsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginDelete(ctx,
		"<resource-group-name>",
		"<gallery-name>",
		"<gallery-application-name>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2020-09-30/examples/ListGalleryApplicationsInAGallery.json
func ExampleGalleryApplicationsClient_ListByGallery() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewGalleryApplicationsClient("<subscription-id>", cred, nil)
	pager := client.ListByGallery("<resource-group-name>",
		"<gallery-name>",
		nil)
	for pager.NextPage(ctx) {
		if err := pager.Err(); err != nil {
			log.Fatalf("failed to advance page: %v", err)
		}
		for _, v := range pager.PageResponse().Value {
			log.Printf("Pager result: %#v\n", v)
		}
	}
}
