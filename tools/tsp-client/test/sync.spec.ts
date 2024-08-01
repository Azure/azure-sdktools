import { cp, rmdir, stat } from "node:fs/promises";
import { syncCommand } from "../src/commands.js";
import { after, before, describe, it } from "node:test";
import { assert } from "chai";
import { getRepoRoot } from "../src/git.js";
import { cwd } from "node:process";
import { joinPaths } from "@typespec/compiler";
import { rm } from "node:fs/promises";

describe("Verify sync command", async function () {
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

  await it("Sync example sdk", async function (done) {
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
    done;
  });

  await it("Sync example sdk with local spec", async function (done) {
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
    done;
  });
});
