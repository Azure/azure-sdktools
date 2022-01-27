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

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/ForceDeleteVirtualMachineScaleSetVM.json
func ExampleVirtualMachineScaleSetVMsClient_BeginDelete() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewVirtualMachineScaleSetVMsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginDelete(ctx,
		"<resource-group-name>",
		"<vm-scale-set-name>",
		"<instance-id>",
		&golang.VirtualMachineScaleSetVMsClientBeginDeleteOptions{ForceDeletion: to.BoolPtr(true)})
	if err != nil {
		log.Fatal(err)
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/GetVirtualMachineScaleSetVMWithUserData.json
func ExampleVirtualMachineScaleSetVMsClient_Get() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewVirtualMachineScaleSetVMsClient("<subscription-id>", cred, nil)
	res, err := client.Get(ctx,
		"<resource-group-name>",
		"<vm-scale-set-name>",
		"<instance-id>",
		&golang.VirtualMachineScaleSetVMsClientGetOptions{Expand: nil})
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Response result: %#v\n", res.VirtualMachineScaleSetVMsClientGetResult)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/GetVirtualMachineScaleSetVMInstanceViewAutoPlacedOnDedicatedHostGroup.json
func ExampleVirtualMachineScaleSetVMsClient_GetInstanceView() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewVirtualMachineScaleSetVMsClient("<subscription-id>", cred, nil)
	res, err := client.GetInstanceView(ctx,
		"<resource-group-name>",
		"<vm-scale-set-name>",
		"<instance-id>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Response result: %#v\n", res.VirtualMachineScaleSetVMsClientGetInstanceViewResult)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/RetrieveBootDiagnosticsDataVMScaleSetVM.json
func ExampleVirtualMachineScaleSetVMsClient_RetrieveBootDiagnosticsData() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewVirtualMachineScaleSetVMsClient("<subscription-id>", cred, nil)
	res, err := client.RetrieveBootDiagnosticsData(ctx,
		"<resource-group-name>",
		"<vm-scale-set-name>",
		"<instance-id>",
		&golang.VirtualMachineScaleSetVMsClientRetrieveBootDiagnosticsDataOptions{SasURIExpirationTimeInMinutes: to.Int32Ptr(60)})
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Response result: %#v\n", res.VirtualMachineScaleSetVMsClientRetrieveBootDiagnosticsDataResult)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/SimulateEvictionOfVmssVM.json
func ExampleVirtualMachineScaleSetVMsClient_SimulateEviction() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewVirtualMachineScaleSetVMsClient("<subscription-id>", cred, nil)
	_, err = client.SimulateEviction(ctx,
		"<resource-group-name>",
		"<vm-scale-set-name>",
		"<instance-id>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/VMScaleSetRunCommand.json
func ExampleVirtualMachineScaleSetVMsClient_BeginRunCommand() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewVirtualMachineScaleSetVMsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginRunCommand(ctx,
		"<resource-group-name>",
		"<vm-scale-set-name>",
		"<instance-id>",
		golang.RunCommandInput{
			CommandID: to.StringPtr("<command-id>"),
			Script: []*string{
				to.StringPtr("# Test multi-line string\r\nWrite-Host Hello World!")},
		},
		nil)
	if err != nil {
		log.Fatal(err)
	}
	res, err := poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Response result: %#v\n", res.VirtualMachineScaleSetVMsClientRunCommandResult)
}
