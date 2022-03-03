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

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/CreateOrUpdateVirtualMachineScaleSetVMExtensions.json
func ExampleVirtualMachineScaleSetVMExtensionsClient_BeginCreateOrUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewVirtualMachineScaleSetVMExtensionsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginCreateOrUpdate(ctx,
		"<resource-group-name>",
		"<vm-scale-set-name>",
		"<instance-id>",
		"<vm-extension-name>",
		test.VirtualMachineScaleSetVMExtension{
			Properties: &test.VirtualMachineExtensionProperties{
				Type:                    to.StringPtr("<type>"),
				AutoUpgradeMinorVersion: to.BoolPtr(true),
				Publisher:               to.StringPtr("<publisher>"),
				Settings: map[string]interface{}{
					"UserName": "xyz@microsoft.com",
					"items": []interface{}{
						map[string]interface{}{
							"name": "text - 2",
							"type": float64(1),
							"content": map[string]interface{}{
								"json": "## New workbook\n---\n\nWelcome to your new workbook.  This area will display text formatted as markdown.\n\n\nWe've included a basic analytics query to get you started. Use the `Edit` button below each section to configure it or add more sections.",
							},
						},
						map[string]interface{}{
							"name": "query - 2",
							"type": float64(3),
							"content": map[string]interface{}{
								"exportToExcelOptions": "visible",
								"query":                "union withsource=TableName *\n| summarize Count=count() by TableName\n| render barchart",
								"queryType":            float64(0),
								"resourceType":         "microsoft.operationalinsights/workspaces",
								"size":                 float64(1),
								"version":              "KqlItem/1.0",
							},
						},
					},
					"styleSettings": map[string]interface{}{},
					"test":          float64(1),
				},
				TypeHandlerVersion: to.StringPtr("<type-handler-version>"),
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
	_ = res.VirtualMachineScaleSetVMExtensionsClientCreateOrUpdateResult
}

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/UpdateVirtualMachineScaleSetVMExtensions.json
func ExampleVirtualMachineScaleSetVMExtensionsClient_BeginUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewVirtualMachineScaleSetVMExtensionsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginUpdate(ctx,
		"<resource-group-name>",
		"<vm-scale-set-name>",
		"<instance-id>",
		"<vm-extension-name>",
		test.VirtualMachineScaleSetVMExtensionUpdate{
			Properties: &test.VirtualMachineExtensionUpdateProperties{
				Type:                    to.StringPtr("<type>"),
				AutoUpgradeMinorVersion: to.BoolPtr(true),
				Publisher:               to.StringPtr("<publisher>"),
				Settings: map[string]interface{}{
					"UserName": "xyz@microsoft.com",
				},
				TypeHandlerVersion: to.StringPtr("<type-handler-version>"),
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
	_ = res.VirtualMachineScaleSetVMExtensionsClientUpdateResult
}

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/DeleteVirtualMachineScaleSetVMExtensions.json
func ExampleVirtualMachineScaleSetVMExtensionsClient_BeginDelete() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewVirtualMachineScaleSetVMExtensionsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginDelete(ctx,
		"<resource-group-name>",
		"<vm-scale-set-name>",
		"<instance-id>",
		"<vm-extension-name>",
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

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/GetVirtualMachineScaleSetVMExtensions.json
func ExampleVirtualMachineScaleSetVMExtensionsClient_Get() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewVirtualMachineScaleSetVMExtensionsClient("<subscription-id>", cred, nil)
	res, err := client.Get(ctx,
		"<resource-group-name>",
		"<vm-scale-set-name>",
		"<instance-id>",
		"<vm-extension-name>",
		&test.VirtualMachineScaleSetVMExtensionsClientGetOptions{Expand: nil})
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
		return
	}
	// TODO: use response item
	_ = res.VirtualMachineScaleSetVMExtensionsClientGetResult
}

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/ListVirtualMachineScaleSetVMExtensions.json
func ExampleVirtualMachineScaleSetVMExtensionsClient_List() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewVirtualMachineScaleSetVMExtensionsClient("<subscription-id>", cred, nil)
	res, err := client.List(ctx,
		"<resource-group-name>",
		"<vm-scale-set-name>",
		"<instance-id>",
		&test.VirtualMachineScaleSetVMExtensionsClientListOptions{Expand: nil})
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
		return
	}
	// TODO: use response item
	_ = res.VirtualMachineScaleSetVMExtensionsClientListResult
}
