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

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
)

// Generated with x-ms-examples file: https://github.com/Azure/azure-rest-api-specs/tree/main/specification/appplatform/resource-manager/Microsoft.AppPlatform/preview/2020-11-01-preview/examples/RuntimeVersions_ListRuntimeVersions.json
func ExampleRuntimeVersionsClient_ListRuntimeVersions() {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("failed to obtain a credential: %v", err)
		return
	}

	ctx := context.Background()
	client := test.NewRuntimeVersionsClient(cred, nil)
	res, err := client.ListRuntimeVersions(ctx,
		nil)
	if err != nil {
		log.Fatalf("failed to finish the request: %v", err)
		return
	}
	// TODO: use response item
	_ = res.RuntimeVersionsClientListRuntimeVersionsResult
}
