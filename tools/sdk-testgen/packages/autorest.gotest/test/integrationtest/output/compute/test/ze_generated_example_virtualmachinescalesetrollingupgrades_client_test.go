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

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
)

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/compute/resource-manager/Microsoft.Compute/stable/2021-03-01/examples/VMScaleSetExtensionRollingUpgrade.json
func ExampleVirtualMachineScaleSetRollingUpgradesClient_BeginStartExtensionUpgrade() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewVirtualMachineScaleSetRollingUpgradesClient("<subscription-id>", cred, nil)
	poller, err := client.BeginStartExtensionUpgrade(ctx,
		"<resource-group-name>",
		"<vm-scale-set-name>",
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
