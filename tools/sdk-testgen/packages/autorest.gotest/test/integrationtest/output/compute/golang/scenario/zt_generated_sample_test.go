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
	"os"
	"runtime/debug"
	"testing"

	"encoding/json"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore"
	"github.com/Azure/azure-sdk-for-go/sdk/azcore/arm"
	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resources/armresources"
	"github.com/go-openapi/jsonpointer"
)

var (
	ctx               context.Context
	cred              azcore.TokenCredential
	con               *arm.Connection
	err               error
	resourceGroup     *armresources.ResourceGroup
	fakeStepVar       = "signalrswaggertest4"
	resourceName      = "signalrswaggertest4"
	location          string
	resourceGroupName string
	subscriptionId    string
	name              string
	fakeScenarioVar   string
)

func scenarioMicrosoftSignalrserviceBasicCrud(t *testing.T) {
	fakeScenarioVar := "signalrswaggertest5"
	resourceName := "$(resourceName)"
	// From step Generate_Unique_Name
	{
		var deploymentExtend *armresources.DeploymentExtended
		deploymentExtend, err = createDeployment(ctx, "Generate_Unique_Name", getAnyJson([]byte(`{"$schema":"https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#","contentVersion":"1.0.0.0","outputs":{"name":{"type":"string","value":"[variables('name').value]"},"resourceName":{"type":"string","value":"[variables('name').value]"}},"resources":[],"variables":{"name":{"type":"string","metadata":{"description":"Name of the SignalR service."},"value":"[concat('sw',uniqueString(resourceGroup().id))]"}}}`)), getAnyJson([]byte(`{}`)))
		if err != nil {
			t.Fatalf("%v\n %v", err, string(debug.Stack()))
		}
		resourceName = deploymentExtend.Properties.Outputs["resourceName"].(map[string]interface{})["value"].(string)
	}

	// From step Create-or-Update-a-proximity-placement-group
	ProximityPlacementGroupsClient := golang.NewProximityPlacementGroupsClient(subscriptionId)
	{
		proximityPlacementGroupsCreateOrUpdateResponse, err := ProximityPlacementGroupsClient.CreateOrUpdate(ctx,
			resourceGroupName,
			resourceName,
			golang.ProximityPlacementGroup{
				Location: to.StringPtr(location),
				Properties: &golang.ProximityPlacementGroupProperties{
					ProximityPlacementGroupType: golang.ProximityPlacementGroupType("Standard").ToPtr(),
				},
			},
			nil)
		if err != nil {
			t.Fatalf("%v\n %v", err, string(debug.Stack()))
		}
		log.Printf("Response result: %#v\n", proximityPlacementGroupsCreateOrUpdateResponse.ProximityPlacementGroupsCreateOrUpdateResult)

		var respBody interface{}
		byteBody, err := response.MarshalJSON()
		if err != nil {
			t.Fatalf("Marshall response body failed: %v", err)
		}
		err = json.Unmarshal(byteBody, &respBody)
		if err != nil {
			t.Fatalf("Unmarshall response body to JSON failed: %v", err)
		}

		pointer, err := jsonpointer.New("/id")
		if err != nil {
			t.Fatalf("Unable to create Jsonpointer for /id : %v", err)
		}
		tmp, _, err := pointer.Get(respBody)
		if err != nil {
			t.Fatalf("Get JsonPointer failed /id in %v: %v", byteBody[:], err)
		}
		fakeScenarioVar = tmp.(string)
	}

	// From step Delete-proximity_placement_group
	{
		_, err = ProximityPlacementGroupsClient.Delete(ctx,
			resourceGroupName,
			resourceName,
			nil)
		if err != nil {
			t.Fatalf("%v\n %v", err, string(debug.Stack()))
		}
	}

	// From step Create_a_vm_with_Host_Encryption_using_encryptionAtHost_property
	VirtualMachinesClient := golang.NewVirtualMachinesClient(subscriptionId)
	{
		fakeStepVar := "signalrswaggertest6"
		virtualMachinesCreateOrUpdatePollerResponse, err := VirtualMachinesClient.BeginCreateOrUpdate(ctx,
			resourceGroupName,
			"myVM",
			golang.VirtualMachine{
				Location: to.StringPtr(location),
				Plan: &golang.Plan{
					Name:      to.StringPtr(fakeStepVar),
					Product:   to.StringPtr("windows-data-science-vm"),
					Publisher: to.StringPtr("microsoft-ads"),
				},
				Properties: &golang.VirtualMachineProperties{
					HardwareProfile: &golang.HardwareProfile{
						VMSize: golang.VirtualMachineSizeTypes("Standard_DS1_v2").ToPtr(),
					},
					NetworkProfile: &golang.NetworkProfile{
						NetworkInterfaces: []*golang.NetworkInterfaceReference{
							{
								ID: to.StringPtr("/subscriptions/" + subscriptionId + "/resourceGroups/" + resourceGroupName + "/providers/Microsoft.Network/networkInterfaces/{existing-nic-name}"),
								Properties: &golang.NetworkInterfaceReferenceProperties{
									Primary: to.BoolPtr(true),
								},
							}},
					},
					OSProfile: &golang.OSProfile{
						AdminPassword: to.StringPtr("{your-password}"),
						AdminUsername: to.StringPtr("{your-username}"),
						ComputerName:  to.StringPtr("myVM"),
					},
					SecurityProfile: &golang.SecurityProfile{
						EncryptionAtHost: to.BoolPtr(true),
					},
					StorageProfile: &golang.StorageProfile{
						ImageReference: &golang.ImageReference{
							Offer:     to.StringPtr("windows-data-science-vm"),
							Publisher: to.StringPtr(fakeScenarioVar),
							SKU:       to.StringPtr("windows2016"),
							Version:   to.StringPtr("latest"),
						},
						OSDisk: &golang.OSDisk{
							Name:         to.StringPtr("myVMosdisk"),
							Caching:      golang.CachingTypesReadOnly.ToPtr(),
							CreateOption: golang.DiskCreateOptionTypes("FromImage").ToPtr(),
							ManagedDisk: &golang.ManagedDiskParameters{
								StorageAccountType: golang.StorageAccountTypes("Standard_LRS").ToPtr(),
							},
						},
					},
				},
			},
			nil)
		if err != nil {
			t.Fatalf("%v\n %v", err, string(debug.Stack()))
		}
		response, err := virtualMachinesCreateOrUpdatePollerResponse.PollUntilDone(ctx, 10*time.Second)
		if err != nil {
			t.Fatalf("%v\n %v", err, string(debug.Stack()))
		}
		log.Printf("Response result: %#v\n", response.VirtualMachinesCreateOrUpdateResult)
	}
}

func scenarioMicrosoftSignalrserviceDeleteonly(t *testing.T) {
	// From step Delete_proximity_placement_group
	ProximityPlacementGroupsClient := golang.NewProximityPlacementGroupsClient(subscriptionId)
	{
		_, err = ProximityPlacementGroupsClient.Delete(ctx,
			resourceGroupName,
			resourceName,
			nil)
		if err != nil {
			t.Fatalf("%v\n %v", err, string(debug.Stack()))
		}
	}
}

func prepare() {
	// From step Delete-proximity-placement-group
	ProximityPlacementGroupsClient := golang.NewProximityPlacementGroupsClient(subscriptionId)
	{
		_, err = ProximityPlacementGroupsClient.Delete(ctx,
			resourceGroupName,
			resourceName,
			nil)
		if err != nil {
			t.Fatalf("%v\n %v", err, string(debug.Stack()))
		}
	}
}

func TestSample(t *testing.T) {
	setUp()
	scenarioMicrosoftSignalrserviceBasicCrud(t)
	scenarioMicrosoftSignalrserviceDeleteonly(t)
	tearDown()
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func createResourceGroup(ctx context.Context, connection *arm.Connection) (*armresources.ResourceGroup, error) {
	rgClient := armresources.NewResourceGroupsClient(connection, subscriptionId)

	param := armresources.ResourceGroup{
		Location: to.StringPtr(location),
	}

	resp, err := rgClient.CreateOrUpdate(ctx, resourceGroupName, param, nil)
	if err != nil {
		return nil, err
	}

	return resp.ResourceGroup, nil
}

func deleteResourceGroup(ctx context.Context, connection *arm.Connection) error {
	rgClient := armresources.NewResourceGroupsClient(connection, subscriptionId)

	poller, err := rgClient.BeginDelete(ctx, resourceGroupName, nil)
	if err != nil {
		return err
	}
	if _, err := poller.PollUntilDone(ctx, 10*time.Second); err != nil {
		return err
	}

	return nil
}

func setUp() {
	ctx = context.Background()
	location = getEnv("LOCATION", "westus")
	resourceGroupName = getEnv("RESOURCE_GROUP_NAME", "scenarioTestTempGroup")
	subscriptionId = getEnv("SUBSCRIPTION_ID", "00000000-00000000-00000000-00000000")

	cred, err = azidentity.NewEnvironmentCredential(nil)
	if err != nil {
		panic(err)
	}

	con = arm.NewDefaultConnection(cred, &arm.ConnectionOptions{
		Logging: azcore.LogOptions{
			IncludeBody: true,
		},
	})
	resourceGroup, err := createResourceGroup(ctx, con)
	if err != nil {
		panic(err)
	}
	log.Printf("Resource Group %s created", *resourceGroup.ID)
	prepare()
}

func tearDown() {
	deleteResourceGroup(ctx, con)
}

func createDeployment(ctx context.Context, deploymentName string, template, params map[string]interface{}) (de *armresources.DeploymentExtended, err error) {
	deployClient := armresources.NewDeploymentsClient(con, subscriptionId)
	poller, err := deployClient.BeginCreateOrUpdate(
		ctx,
		resourceGroupName,
		deploymentName,
		armresources.Deployment{
			Properties: &armresources.DeploymentProperties{
				Template:   template,
				Parameters: params,
				Mode:       armresources.DeploymentModeIncremental.ToPtr(),
			},
		},
		&armresources.DeploymentsBeginCreateOrUpdateOptions{},
	)
	if err != nil {
		return nil, err
	}

	res, err := poller.PollUntilDone(ctx, 10*time.Second)
	if err != nil {
		return nil, err
	}

	return res.DeploymentExtended, nil
}

func getAnyJson(customJSON []byte) map[string]interface{} {
	var anyJson map[string]interface{}
	_ = json.Unmarshal(customJSON, &anyJson)
	return anyJson
}
