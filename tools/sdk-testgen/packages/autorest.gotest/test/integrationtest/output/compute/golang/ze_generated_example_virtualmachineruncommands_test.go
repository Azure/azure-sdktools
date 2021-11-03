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

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/VirtualMachineRunCommandList.json
func ExampleVirtualMachineRunCommandsClient_List() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewVirtualMachineRunCommandsClient("<subscription-id>", cred, nil)
	pager := client.List("<location>",
		nil)
	for pager.NextPage(ctx) {
		if err := pager.Err(); err != nil {
			log.Fatalf("failed to advance page: %v", err)
		}
		for _, v := range pager.PageResponse().Value {
			log.Printf("RunCommandDocumentBase.ID: %s\n", *v.ID)
		}
	}
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/VirtualMachineRunCommandGet.json
func ExampleVirtualMachineRunCommandsClient_Get() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewVirtualMachineRunCommandsClient("<subscription-id>", cred, nil)
	res, err := client.Get(ctx,
		"<location>",
		"<command-id>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("RunCommandDocument.ID: %s\n", *res.ID)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/CreateOrUpdateRunCommand.json
func ExampleVirtualMachineRunCommandsClient_BeginCreateOrUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewVirtualMachineRunCommandsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginCreateOrUpdate(ctx,
		"<resource-group-name>",
		"<vm-name>",
		"<run-command-name>",
		golang.VirtualMachineRunCommand{
			Resource: golang.Resource{
				Location: to.StringPtr("<location>"),
			},
			Properties: &golang.VirtualMachineRunCommandProperties{
				AsyncExecution: to.BoolPtr(false),
				Parameters: []*golang.RunCommandInputParameter{
					&golang.RunCommandInputParameter{
						Name:  to.StringPtr("<name>"),
						Value: to.StringPtr("<value>"),
					},
					&golang.RunCommandInputParameter{
						Name:  to.StringPtr("<name>"),
						Value: to.StringPtr("<value>"),
					}},
				RunAsPassword: to.StringPtr("<run-as-password>"),
				RunAsUser:     to.StringPtr("<run-as-user>"),
				Source: &golang.VirtualMachineRunCommandScriptSource{
					Script: to.StringPtr("<script>"),
				},
				TimeoutInSeconds: to.Int32Ptr(3600),
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
	log.Printf("VirtualMachineRunCommand.ID: %s\n", *res.ID)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/UpdateRunCommand.json
func ExampleVirtualMachineRunCommandsClient_BeginUpdate() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewVirtualMachineRunCommandsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginUpdate(ctx,
		"<resource-group-name>",
		"<vm-name>",
		"<run-command-name>",
		golang.VirtualMachineRunCommandUpdate{
			Properties: &golang.VirtualMachineRunCommandProperties{
				Source: &golang.VirtualMachineRunCommandScriptSource{
					Script: to.StringPtr("<script>"),
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
	log.Printf("VirtualMachineRunCommand.ID: %s\n", *res.ID)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/DeleteRunCommand.json
func ExampleVirtualMachineRunCommandsClient_BeginDelete() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewVirtualMachineRunCommandsClient("<subscription-id>", cred, nil)
	poller, err := client.BeginDelete(ctx,
		"<resource-group-name>",
		"<vm-name>",
		"<run-command-name>",
		nil)
	if err != nil {
		log.Fatal(err)
	}
	_, err = poller.PollUntilDone(ctx, 30*time.Second)
	if err != nil {
		log.Fatal(err)
	}
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/GetRunCommand.json
func ExampleVirtualMachineRunCommandsClient_GetByVirtualMachine() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewVirtualMachineRunCommandsClient("<subscription-id>", cred, nil)
	res, err := client.GetByVirtualMachine(ctx,
		"<resource-group-name>",
		"<vm-name>",
		"<run-command-name>",
		&golang.VirtualMachineRunCommandsGetByVirtualMachineOptions{Expand: nil})
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("VirtualMachineRunCommand.ID: %s\n", *res.ID)
}

// x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/ListRunCommandsInVM.json
func ExampleVirtualMachineRunCommandsClient_ListByVirtualMachine() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
	}
	ctx := context.Background()
	client := golang.NewVirtualMachineRunCommandsClient("<subscription-id>", cred, nil)
	pager := client.ListByVirtualMachine("<resource-group-name>",
		"<vm-name>",
		&golang.VirtualMachineRunCommandsListByVirtualMachineOptions{Expand: nil})
	for pager.NextPage(ctx) {
		if err := pager.Err(); err != nil {
			log.Fatalf("failed to advance page: %v", err)
		}
		for _, v := range pager.PageResponse().Value {
			log.Printf("VirtualMachineRunCommand.ID: %s\n", *v.ID)
		}
	}
}
