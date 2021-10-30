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

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2020-09-30/examples/CreateOrUpdateASimpleGalleryApplicationVersion.json
func ExampleGalleryApplicationVersionsClient_BeginCreateOrUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewGalleryApplicationVersionsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginCreateOrUpdate(ctx,
		"<resource-group-name>",
		"<gallery-name>",
		"<gallery-application-name>",
		"<gallery-application-version-name>",
		golang.GalleryApplicationVersion{
			Resource: golang.Resource{
				Location: to.StringPtr("<location>"),
			},
			Properties: &golang.GalleryApplicationVersionProperties{
				PublishingProfile: &golang.GalleryApplicationVersionPublishingProfile{
					GalleryArtifactPublishingProfileBase: golang.GalleryArtifactPublishingProfileBase{
						EndOfLifeDate:      to.TimePtr(func() time.Time { t, _ := time.Parse(time.RFC3339Nano, "2019-07-01T07:00:00Z"); return t }()),
						ReplicaCount:       to.Int32Ptr(1),
						StorageAccountType: golang.StorageAccountTypeStandardLRS.ToPtr(),
						TargetRegions: []*golang.TargetRegion{
							{
								Name:                 to.StringPtr("<name>"),
								RegionalReplicaCount: to.Int32Ptr(1),
								StorageAccountType:   golang.StorageAccountTypeStandardLRS.ToPtr(),
							}},
					},
					ManageActions: &golang.UserArtifactManage{
						Install: to.StringPtr("<install>"),
						Remove:  to.StringPtr("<remove>"),
					},
					Source: &golang.UserArtifactSource{
						MediaLink: to.StringPtr("<media-link>"),
					},
				},
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
	log.Printf("GalleryApplicationVersion.ID: %s\n", *res.ID)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2020-09-30/examples/UpdateASimpleGalleryApplicationVersion.json
func ExampleGalleryApplicationVersionsClient_BeginUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewGalleryApplicationVersionsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginUpdate(ctx,
		"<resource-group-name>",
		"<gallery-name>",
		"<gallery-application-name>",
		"<gallery-application-version-name>",
		golang.GalleryApplicationVersionUpdate{
			Properties: &golang.GalleryApplicationVersionProperties{
				PublishingProfile: &golang.GalleryApplicationVersionPublishingProfile{
					GalleryArtifactPublishingProfileBase: golang.GalleryArtifactPublishingProfileBase{
						EndOfLifeDate:      to.TimePtr(func() time.Time { t, _ := time.Parse(time.RFC3339Nano, "2019-07-01T07:00:00Z"); return t }()),
						ReplicaCount:       to.Int32Ptr(1),
						StorageAccountType: golang.StorageAccountTypeStandardLRS.ToPtr(),
						TargetRegions: []*golang.TargetRegion{
							{
								Name:                 to.StringPtr("<name>"),
								RegionalReplicaCount: to.Int32Ptr(1),
								StorageAccountType:   golang.StorageAccountTypeStandardLRS.ToPtr(),
							}},
					},
					ManageActions: &golang.UserArtifactManage{
						Install: to.StringPtr("<install>"),
						Remove:  to.StringPtr("<remove>"),
					},
					Source: &golang.UserArtifactSource{
						MediaLink: to.StringPtr("<media-link>"),
					},
				},
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
	log.Printf("GalleryApplicationVersion.ID: %s\n", *res.ID)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2020-09-30/examples/GetAGalleryApplicationVersionWithReplicationStatus.json
func ExampleGalleryApplicationVersionsClient_Get() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewGalleryApplicationVersionsClient("<subscription-id>", cred, nil)
	res, err := client.Get(ctx,
		"<resource-group-name>",
		"<gallery-name>",
		"<gallery-application-name>",
		"<gallery-application-version-name>",
		&golang.GalleryApplicationVersionsGetOptions{Expand: golang.ReplicationStatusTypesReplicationStatus.ToPtr()})
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("GalleryApplicationVersion.ID: %s\n", *res.ID)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2020-09-30/examples/DeleteAGalleryApplicationVersion.json
func ExampleGalleryApplicationVersionsClient_BeginDelete() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewGalleryApplicationVersionsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginDelete(ctx,
		"<resource-group-name>",
		"<gallery-name>",
		"<gallery-application-name>",
		"<gallery-application-version-name>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2020-09-30/examples/ListGalleryApplicationVersionsInAGalleryApplication.json
func ExampleGalleryApplicationVersionsClient_ListByGalleryApplication() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewGalleryApplicationVersionsClient("<subscription-id>", cred, nil)
	pager := client.ListByGalleryApplication("<resource-group-name>",
		"<gallery-name>",
		"<gallery-application-name>",
		nil)
	for pager.NextPage(ctx) {
		if err := pager.Err(); err != nil {
			log.Fatalf("failed to advance page: %v", err)
		}
		for _, v := range pager.PageResponse().Value {
			log.Printf("GalleryApplicationVersion.ID: %s\n", *v.ID)
		}
	}
}
