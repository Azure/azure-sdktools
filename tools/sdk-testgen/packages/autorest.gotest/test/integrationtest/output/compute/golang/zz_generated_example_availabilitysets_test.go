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

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
)

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/CreateAnAvailabilitySet.json
func ExampleAvailabilitySetsClient_CreateOrUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewAvailabilitySetsClient("<subscription-id>", cred, nil)
	res, err := client.CreateOrUpdate(ctx,
		"<resource-group-name>",
		"<availability-set-name>",
		golang.AvailabilitySet{
			Resource: golang.Resource{
				Location: to.StringPtr("<location>"),
			},
			Properties: &golang.AvailabilitySetProperties{
				PlatformFaultDomainCount:  to.Int32Ptr(2),
				PlatformUpdateDomainCount: to.Int32Ptr(20),
			},
		},
		nil)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("AvailabilitySet.ID: %s\n", *res.ID)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/ListAvailabilitySetsInASubscription.json
func ExampleAvailabilitySetsClient_ListBySubscription() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewAvailabilitySetsClient("<subscription-id>", cred, nil)
	pager := client.ListBySubscription(&golang.AvailabilitySetsListBySubscriptionOptions{Expand: to.StringPtr("<expand>")})
	for pager.NextPage(ctx) {
		if err := pager.Err(); err != nil {
			log.Fatalf("failed to advance page: %v", err)
		}
		for _, v := range pager.PageResponse().Value {
			log.Printf("AvailabilitySet.ID: %s\n", *v.ID)
		}
	}
}
