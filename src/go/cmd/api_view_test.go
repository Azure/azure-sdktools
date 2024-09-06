// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

package cmd

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestMain(m *testing.M) {
	indexTestdata = true
	os.Exit(m.Run())
}

func TestFuncDecl(t *testing.T) {
	p, err := createReview(filepath.Clean("testdata/test_func_decl"))
	if err != nil {
		t.Fatal(err)
	}
	if len(p.Tokens) != 42 {
		t.Fatal("unexpected token length, signals a change in the output")
	}
	if p.Name != "test_func_decl" {
		t.Fatal("unexpected package name")
	}
	if len(p.Navigation) != 1 {
		t.Fatal("nagivation slice length should only be one for one package")
	}
	if len(p.Navigation[0].ChildItems) != 1 {
		t.Fatal("unexpected number of child items")
	}
}

func TestInterface(t *testing.T) {
	p, err := createReview(filepath.Clean("testdata/test_interface"))
	if err != nil {
		t.Fatal(err)
	}
	if len(p.Tokens) != 46 {
		t.Fatal("unexpected token length, signals a change in the output")
	}
	if p.Name != "test_interface" {
		t.Fatal("unexpected package name")
	}
	if len(p.Navigation) != 1 {
		t.Fatal("nagivation slice length should only be one for one package")
	}
	if len(p.Navigation[0].ChildItems) != 2 {
		t.Fatal("unexpected number of child items")
	}
}

func TestMultiModule(t *testing.T) {
	for _, path := range []string{
		"testdata/test_multi_module",
		"testdata/test_multi_module/A",
		"testdata/test_multi_module/A/B",
	} {
		t.Run(path, func(t *testing.T) {
			p, err := createReview(filepath.Clean(path))
			require.NoError(t, err)
			require.Equal(t, 1, len(p.Navigation), "review should include only one package")
			require.Equal(t, filepath.Base(path), p.Navigation[0].Text, "review includes the wrong module")
		})
	}
}

func TestStruct(t *testing.T) {
	p, err := createReview(filepath.Clean("testdata/test_struct"))
	if err != nil {
		t.Fatal(err)
	}
	if len(p.Tokens) != 68 {
		t.Fatal("unexpected token length, signals a change in the output")
	}
	if p.Name != "test_struct" {
		t.Fatal("unexpected package name")
	}
	if len(p.Navigation) != 1 {
		t.Fatal("nagivation slice length should only be one for one package")
	}
	if len(p.Navigation[0].ChildItems) != 1 {
		t.Fatal("nagivation slice length should include link for ctor and struct")
	}
}

func TestConst(t *testing.T) {
	p, err := createReview(filepath.Clean("testdata/test_const"))
	if err != nil {
		t.Fatal(err)
	}
	if len(p.Tokens) != 76 {
		t.Fatal("unexpected token length, signals a change in the output")
	}
	if p.Name != "test_const" {
		t.Fatal("unexpected package name")
	}
	if len(p.Navigation) != 1 {
		t.Fatal("nagivation slice length should only be one for one package")
	}
	if len(p.Navigation[0].ChildItems) != 4 {
		t.Fatal("unexpected child navigation items length")
	}
}

func TestSubpackage(t *testing.T) {
	review, err := createReview(filepath.Clean("testdata/test_subpackage"))
	require.NoError(t, err)
	require.Equal(t, "Go", review.Language)
	require.Equal(t, "test_subpackage", review.Name)
	seen := map[string]bool{}
	for _, token := range review.Tokens {
		if token.DefinitionID != nil {
			if seen[*token.DefinitionID] {
				t.Fatal("duplicate DefinitionID: " + *token.DefinitionID)
			}
			seen[*token.DefinitionID] = true
		}
	}
	// 2 packages * 10 exports each = 22 unique definition IDs expected
	require.Equal(t, 22, len(seen))
	// 10 exports - 4 methods = 6 nav links expected
	require.Equal(t, 2, len(review.Navigation))
	expectedPackages := []string{"test_subpackage", "test_subpackage/subpackage"}
	for _, nav := range review.Navigation {
		require.Contains(t, expectedPackages, nav.Text)
		require.Equal(t, 6, len(nav.ChildItems))
		for _, item := range nav.ChildItems {
			require.Contains(t, seen, item.NavigationId)
		}
	}
}

func TestDiagnostics(t *testing.T) {
	review, err := createReview(filepath.Clean("testdata/test_diagnostics"))
	require.NoError(t, err)
	require.Equal(t, "Go", review.Language)
	require.Equal(t, "test_diagnostics", review.Name)
	require.Equal(t, 4, len(review.Diagnostics))
	for _, diagnostic := range review.Diagnostics {
		switch target := diagnostic.TargetID; target {
		case "test_diagnostics.Alias":
			require.Equal(t, DiagnosticLevelInfo, diagnostic.Level)
			require.Equal(t, aliasFor+"internal.InternalStruct", diagnostic.Text)
		case "test_diagnostics.ExportedStruct":
			require.Equal(t, DiagnosticLevelError, diagnostic.Level)
			require.Equal(t, diagnostic.Text, embedsUnexportedStruct+"unexportedStruct")
		case "test_diagnostics.ExternalAlias":
			require.Equal(t, DiagnosticLevelWarning, diagnostic.Level)
			require.Equal(t, aliasFor+"net/http.Client", diagnostic.Text)
		case "test_diagnostics.Sealed":
			require.Equal(t, DiagnosticLevelInfo, diagnostic.Level)
			require.Equal(t, sealedInterface, diagnostic.Text)
		default:
			t.Fatal("unexpected target " + target)
		}
	}
}

func TestExternalModule(t *testing.T) {
	review, err := createReview(filepath.Clean("testdata/test_external_module"))
	require.NoError(t, err)
	require.Equal(t, 1, len(review.Diagnostics))
	require.Equal(t, aliasFor+"github.com/Azure/azure-sdk-for-go/sdk/azcore.Policy", review.Diagnostics[0].Text)
	require.Equal(t, 1, len(review.Navigation))
	require.Equal(t, 1, len(review.Navigation[0].ChildItems))
	foundDo, foundPolicy := false, false
	for _, token := range review.Tokens {
		if token.DefinitionID != nil && *token.DefinitionID == "test_external_module.MyPolicy" {
			require.Equal(t, "MyPolicy", token.Value)
			foundPolicy = true
		} else if token.Value == "Do" {
			foundDo = true
			require.Contains(t, *token.DefinitionID, "MyPolicy")
		}
	}
	require.True(t, foundDo, "missing MyPolicy.Do()")
	require.True(t, foundPolicy, "missing MyPolicy type")
}

func TestAliasDefinitions(t *testing.T) {
	for _, test := range []struct {
		name, path, sourceName string
		diagLevel              DiagnosticLevel
	}{
		{
			diagLevel:  DiagnosticLevelWarning,
			name:       "service_group",
			path:       "testdata/test_service_group/group/test_alias_export",
			sourceName: "github.com/Azure/azure-sdk-tools/src/go/cmd/testdata/test_service_group/group/internal.Foo",
		},
		{
			diagLevel:  DiagnosticLevelInfo,
			name:       "internal_package",
			path:       "testdata/test_alias_export",
			sourceName: "internal/exported.Foo",
		},
		{
			diagLevel:  DiagnosticLevelWarning,
			name:       "external_package",
			path:       "testdata/test_external_alias_exporter",
			sourceName: "github.com/Azure/azure-sdk-tools/src/go/cmd/testdata/test_external_alias_source.Foo",
		},
	} {
		t.Run(test.name, func(t *testing.T) {
			p, err := filepath.Abs(test.path)
			require.NoError(t, err)
			review, err := createReview(p)
			require.NoError(t, err)
			require.Equal(t, "Go", review.Language)
			require.Equal(t, 1, len(review.Diagnostics))
			require.Equal(t, test.diagLevel, review.Diagnostics[0].Level)
			require.Equal(t, aliasFor+test.sourceName, review.Diagnostics[0].Text)
			require.Equal(t, 1, len(review.Navigation))
			require.Equal(t, filepath.Base(test.path), review.Navigation[0].Text)
			for _, token := range review.Tokens {
				if token.Value == "Bar" {
					return
				}
			}
			t.Fatal("review doesn't contain the aliased struct's definition")
		})
	}
}

func TestRecursiveAliasDefinitions(t *testing.T) {
	for _, test := range []struct {
		name, path, sourceName string
		diagLevel              DiagnosticLevel
	}{
		{
			diagLevel:  DiagnosticLevelInfo,
			name:       "internal_package",
			path:       "testdata/test_recursive_alias",
			sourceName: "service.Foo",
		},
	} {
		t.Run(test.name, func(t *testing.T) {
			review, err := createReview(filepath.Clean(test.path))
			require.NoError(t, err)
			require.Equal(t, "Go", review.Language)
			require.Equal(t, 2, len(review.Diagnostics))
			require.Equal(t, test.diagLevel, review.Diagnostics[0].Level)
			require.Equal(t, aliasFor+test.sourceName, review.Diagnostics[0].Text)
			require.Equal(t, 2, len(review.Navigation))
			require.Equal(t, filepath.Base(test.path), review.Navigation[0].Text)
			for _, token := range review.Tokens {
				if token.Value == "Bar" {
					return
				}
			}
			t.Fatal("review doesn't contain the aliased struct's definition")
		})
	}
}

func TestAliasDiagnostics(t *testing.T) {
	review, err := createReview(filepath.Clean("testdata/test_alias_diagnostics"))
	require.NoError(t, err)
	require.Equal(t, "Go", review.Language)
	require.Equal(t, "test_alias_diagnostics", review.Name)
	require.Equal(t, 6, len(review.Diagnostics))
	for _, diagnostic := range review.Diagnostics {
		if diagnostic.TargetID == "test_alias_diagnostics.WidgetValue" {
			require.Equal(t, DiagnosticLevelInfo, diagnostic.Level)
			require.Equal(t, aliasFor+"internal.WidgetValue", diagnostic.Text)
		} else {
			require.Equal(t, "test_alias_diagnostics.Widget", diagnostic.TargetID)
			switch diagnostic.Level {
			case DiagnosticLevelInfo:
				require.Equal(t, aliasFor+"internal.Widget", diagnostic.Text)
			case DiagnosticLevelError:
				switch txt := diagnostic.Text; txt {
				case missingAliasFor + "WidgetProperties":
				case missingAliasFor + "WidgetPropertiesP":
				case missingAliasFor + "WidgetThings":
				case missingAliasFor + "WidgetThingsP":
				default:
					t.Fatalf("unexpected diagnostic text %s", txt)
				}
			default:
				t.Fatalf("unexpected diagnostic level %d", diagnostic.Level)
			}
		}
	}
}

func TestMajorVersion(t *testing.T) {
	review, err := createReview(filepath.Clean("testdata/test_major_version"))
	require.NoError(t, err)
	require.Equal(t, "Go", review.Language)
	require.Equal(t, "test_major_version", review.Name)
	require.Equal(t, 1, len(review.Navigation))
	require.Equal(t, "test_major_version/subpackage", review.Navigation[0].Text)
}

func TestVars(t *testing.T) {
	review, err := createReview(filepath.Clean("testdata/test_vars"))
	require.NoError(t, err)
	require.NotZero(t, review)
	countSomeChoice := 0
	hasHTTPClient := false
	for i := range review.Tokens {
		if review.Tokens[i].Value == "SomeChoice" && review.Tokens[i-1].Value == "*" {
			countSomeChoice++
		} else if review.Tokens[i].Value == "http.Client" && review.Tokens[i-1].Value == "*" {
			hasHTTPClient = true
		}
	}
	require.EqualValues(t, 2, countSomeChoice)
	require.True(t, hasHTTPClient)
}

func Test_getPackageNameFromModPath(t *testing.T) {
	require.EqualValues(t, "foo", getPackageNameFromModPath("foo"))
	require.EqualValues(t, "foo", getPackageNameFromModPath("foo/v2"))
	require.EqualValues(t, "sdk/foo", getPackageNameFromModPath("github.com/Azure/azure-sdk-for-go/sdk/foo"))
	require.EqualValues(t, "sdk/foo/bar", getPackageNameFromModPath("github.com/Azure/azure-sdk-for-go/sdk/foo/bar"))
	require.EqualValues(t, "sdk/foo/bar", getPackageNameFromModPath("github.com/Azure/azure-sdk-for-go/sdk/foo/bar/v5"))
}

func TestDeterministicOutput(t *testing.T) {
	for i := 0; i < 100; i++ {
		review1, err := createReview(filepath.Clean("testdata/test_multi_recursive_alias"))
		require.NoError(t, err)
		review2, err := createReview(filepath.Clean("testdata/test_multi_recursive_alias"))
		require.NoError(t, err)

		output1, err := json.MarshalIndent(review1, "", " ")
		require.NoError(t, err)
		output2, err := json.MarshalIndent(review2, "", " ")
		require.NoError(t, err)

		require.EqualValues(t, string(output1), string(output2))
	}
}
