import { cp, rmdir, stat } from "node:fs/promises";
import { generateCommand, syncCommand, updateCommand } from "../src/commands.js";
import { after, before, describe, it } from "node:test";
import { assert } from "chai";
import { getRepoRoot } from "../src/git.js";
import { cwd } from "node:process";
import { joinPaths } from "@typespec/compiler";
import { rm } from "node:fs/promises";

describe("Verify commands", async function () {
  before(async function () {
    await cp(
      "./test/utils/emitter-package.json",
      joinPaths(await getRepoRoot(cwd()), "eng", "emitter-package.json"),
    );
  });

  after(async function () {
    await rm(joinPaths(await getRepoRoot(cwd()), "eng", "emitter-package.json"));
    await rmdir(
      "./test/examples/sdk/contosowidgetmanager/contosowidgetmanager-rest/TempTypeSpecFiles/",
      { recursive: true },
    );
    await rmdir("./test/examples/sdk/local-spec-sdk/TempTypeSpecFiles/", { recursive: true });
  });

  await it("Sync example sdk", async function () {
    try {
      const args = {
        "output-dir": "./test/examples/sdk/contosowidgetmanager/contosowidgetmanager-rest",
      };
      await syncCommand(args);
    } catch (error) {
      assert.fail(`Failed to sync files. Error: ${error}`);
    }
    const dir = await stat(
      "./test/examples/sdk/contosowidgetmanager/contosowidgetmanager-rest/TempTypeSpecFiles/",
    );
    assert.isTrue(dir.isDirectory());
  });

  await it("Sync example sdk with local spec", async function () {
    try {
      const args = {
        "output-dir": "./test/examples/sdk/local-spec-sdk",
        "local-spec-repo":
          "./test/examples/specification/contosowidgetmanager/Contoso.WidgetManager",
      };
      await syncCommand(args);
    } catch (error) {
      assert.fail(`Failed to sync files. Error: ${error}`);
    }
    const dir = await stat("./test/examples/sdk/local-spec-sdk/TempTypeSpecFiles/");
    assert.isTrue(dir.isDirectory());
  });

  await it("Generate example sdk", async function () {
    try {
      const args = {
        "output-dir": "./test/examples/sdk/contosowidgetmanager/contosowidgetmanager-rest",
        "save-inputs": true,
      };
      await generateCommand(args);
    } catch (error) {
      assert.fail(`Failed to generate. Error: ${error}`);
    }
    const dir = await stat(
      "./test/examples/sdk/contosowidgetmanager/contosowidgetmanager-rest/tsp-location.yaml",
    );
    assert.isTrue(dir.isFile());
  });

  await it("Update example sdk", async function () {
    try {
      const args = {
        "output-dir": "./test/examples/sdk/contosowidgetmanager/contosowidgetmanager-rest",
        "save-inputs": true,
      };
      await updateCommand(args);
    } catch (error) {
      assert.fail(`Failed to generate. Error: ${error}`);
    }
  });

  await it("Update example sdk & pass tspconfig.yaml", async function () {
    try {
      const args = {
        "output-dir": "./test/examples/sdk/contosowidgetmanager/contosowidgetmanager-rest",
        "tsp-config":
          "https://github.com/Azure/azure-rest-api-specs/blob/db63bea839f5648462c94e685d5cc96f8e8b38ba/specification/contosowidgetmanager/Contoso.WidgetManager/tspconfig.yaml",
        "save-inputs": true,
      };
      await updateCommand(args);
    } catch (error) {
      assert.fail(`Failed to generate. Error: ${error}`);
    }
  });

  await it("Update example sdk & pass commit", async function () {
    try {
      const args = {
        "output-dir": "./test/examples/sdk/contosowidgetmanager/contosowidgetmanager-rest",
        commit: "db63bea839f5648462c94e685d5cc96f8e8b38ba",
        "save-inputs": true,
      };
      await updateCommand(args);
    } catch (error) {
      assert.fail(`Failed to update. Error: ${error}`);
    }
  });

  await it("Update example sdk & pass only --repo", async function () {
    try {
      const args = {
        "output-dir": "./test/examples/sdk/contosowidgetmanager/contosowidgetmanager-rest",
        repo: "foo",
        "save-inputs": true,
      };
      await updateCommand(args);
      assert.fail("Should have failed");
    } catch (error: any) {
      assert.equal(
        error.message,
        "Commit SHA is required when specifying `--repo`; please specify a commit using `--commit`",
      );
    }
  });
});
