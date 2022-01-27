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

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/CreateCloudServiceWithMultiRole.json
func ExampleCloudServicesClient_BeginCreateOrUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewCloudServicesClient("<subscription-id>", cred, nil)
	poller, err := client.BeginCreateOrUpdate(ctx,
		"<resource-group-name>",
		"<cloud-service-name>",
		&golang.CloudServicesClientBeginCreateOrUpdateOptions{Parameters: &golang.CloudService{
			Location: to.StringPtr("<location>"),
			Properties: &golang.CloudServiceProperties{
				Configuration: to.StringPtr("<configuration>"),
				NetworkProfile: &golang.CloudServiceNetworkProfile{
					LoadBalancerConfigurations: []*golang.LoadBalancerConfiguration{
						{
							Name: to.StringPtr("<name>"),
							Properties: &golang.LoadBalancerConfigurationProperties{
								FrontendIPConfigurations: []*golang.LoadBalancerFrontendIPConfiguration{
									{
										Name: to.StringPtr("<name>"),
										Properties: &golang.LoadBalancerFrontendIPConfigurationProperties{
											PublicIPAddress: &golang.SubResource{
												ID: to.StringPtr("<id>"),
											},
										},
									}},
							},
						}},
				},
				PackageURL: to.StringPtr("<package-url>"),
				RoleProfile: &golang.CloudServiceRoleProfile{
					Roles: []*golang.CloudServiceRoleProfileProperties{
						{
							Name: to.StringPtr("<name>"),
							SKU: &golang.CloudServiceRoleSKU{
								Name:     to.StringPtr("<name>"),
								Capacity: to.Int64Ptr(1),
								Tier:     to.StringPtr("<tier>"),
							},
						},
						{
							Name: to.StringPtr("<name>"),
							SKU: &golang.CloudServiceRoleSKU{
								Name:     to.StringPtr("<name>"),
								Capacity: to.Int64Ptr(1),
								Tier:     to.StringPtr("<tier>"),
							},
						}},
				},
				UpgradeMode: golang.CloudServiceUpgradeMode("Auto").ToPtr(),
			},
		},
		})
	if err != nil {
		log.Fatal(err)
	}
	res, err := poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Response result: %#v\n", res.CloudServicesClientCreateOrUpdateResult)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/UpdateCloudServiceToIncludeTags.json
func ExampleCloudServicesClient_BeginUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewCloudServicesClient("<subscription-id>", cred, nil)
	poller, err := client.BeginUpdate(ctx,
		"<resource-group-name>",
		"<cloud-service-name>",
		&golang.CloudServicesClientBeginUpdateOptions{Parameters: &golang.CloudServiceUpdate{
			Tags: map[string]*string{
				"Documentation": to.StringPtr("RestAPI"),
			},
		},
		})
	if err != nil {
		log.Fatal(err)
	}
	res, err := poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Response result: %#v\n", res.CloudServicesClientUpdateResult)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/DeleteCloudService.json
func ExampleCloudServicesClient_BeginDelete() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewCloudServicesClient("<subscription-id>", cred, nil)
	poller, err := client.BeginDelete(ctx,
		"<resource-group-name>",
		"<cloud-service-name>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/GetCloudServiceWithMultiRoleAndRDP.json
func ExampleCloudServicesClient_Get() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewCloudServicesClient("<subscription-id>", cred, nil)
	res, err := client.Get(ctx,
		"<resource-group-name>",
		"<cloud-service-name>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Response result: %#v\n", res.CloudServicesClientGetResult)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/GetCloudServiceInstanceViewWithMultiRole.json
func ExampleCloudServicesClient_GetInstanceView() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewCloudServicesClient("<subscription-id>", cred, nil)
	res, err := client.GetInstanceView(ctx,
		"<resource-group-name>",
		"<cloud-service-name>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Response result: %#v\n", res.CloudServicesClientGetInstanceViewResult)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/ListCloudServicesInSubscription.json
func ExampleCloudServicesClient_ListAll() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewCloudServicesClient("<subscription-id>", cred, nil)
	pager := client.ListAll(nil)
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

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/ListCloudServicesInResourceGroup.json
func ExampleCloudServicesClient_List() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewCloudServicesClient("<subscription-id>", cred, nil)
	pager := client.List("<resource-group-name>",
		nil)
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

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/StartCloudService.json
func ExampleCloudServicesClient_BeginStart() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewCloudServicesClient("<subscription-id>", cred, nil)
	poller, err := client.BeginStart(ctx,
		"<resource-group-name>",
		"<cloud-service-name>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/PowerOffCloudService.json
func ExampleCloudServicesClient_BeginPowerOff() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewCloudServicesClient("<subscription-id>", cred, nil)
	poller, err := client.BeginPowerOff(ctx,
		"<resource-group-name>",
		"<cloud-service-name>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/RestartCloudServiceRoleInstances.json
func ExampleCloudServicesClient_BeginRestart() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewCloudServicesClient("<subscription-id>", cred, nil)
	poller, err := client.BeginRestart(ctx,
		"<resource-group-name>",
		"<cloud-service-name>",
		&golang.CloudServicesClientBeginRestartOptions{Parameters: &golang.RoleInstances{
			RoleInstances: []*string{
				to.StringPtr("ContosoFrontend_IN_0"),
				to.StringPtr("ContosoBackend_IN_1")},
		},
		})
	if err != nil {
		log.Fatal(err)
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/ReimageCloudServiceRoleInstances.json
func ExampleCloudServicesClient_BeginReimage() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewCloudServicesClient("<subscription-id>", cred, nil)
	poller, err := client.BeginReimage(ctx,
		"<resource-group-name>",
		"<cloud-service-name>",
		&golang.CloudServicesClientBeginReimageOptions{Parameters: &golang.RoleInstances{
			RoleInstances: []*string{
				to.StringPtr("ContosoFrontend_IN_0"),
				to.StringPtr("ContosoBackend_IN_1")},
		},
		})
	if err != nil {
		log.Fatal(err)
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/RebuildCloudServiceRoleInstances.json
func ExampleCloudServicesClient_BeginRebuild() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewCloudServicesClient("<subscription-id>", cred, nil)
	poller, err := client.BeginRebuild(ctx,
		"<resource-group-name>",
		"<cloud-service-name>",
		&golang.CloudServicesClientBeginRebuildOptions{Parameters: &golang.RoleInstances{
			RoleInstances: []*string{
				to.StringPtr("ContosoFrontend_IN_0"),
				to.StringPtr("ContosoBackend_IN_1")},
		},
		})
	if err != nil {
		log.Fatal(err)
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/DeleteCloudServiceRoleInstances.json
func ExampleCloudServicesClient_BeginDeleteInstances() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewCloudServicesClient("<subscription-id>", cred, nil)
	poller, err := client.BeginDeleteInstances(ctx,
		"<resource-group-name>",
		"<cloud-service-name>",
		&golang.CloudServicesClientBeginDeleteInstancesOptions{Parameters: &golang.RoleInstances{
			RoleInstances: []*string{
				to.StringPtr("ContosoFrontend_IN_0"),
				to.StringPtr("ContosoBackend_IN_1")},
		},
		})
	if err != nil {
		log.Fatal(err)
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
}
