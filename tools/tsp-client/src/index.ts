import * as path from "node:path";

import { installDependencies } from "./npm.js";
import { createTempDirectory, removeDirectory,readTspLocation, getEmitterFromRepoConfig } from "./fs.js";
import { Logger, printBanner, enableDebug, printVersion } from "./log.js";
import { compileTsp } from "./typespec.js";
import { getOptions } from "./options.js";
import { mkdir, readdir, writeFile, cp, readFile } from "node:fs/promises";
import { addSpecFiles, checkoutCommit, cloneRepo, getRepoRoot, sparseCheckout } from "./git.js";
import { fetch } from "./network.js";
import { parse as parseYaml } from "yaml";

async function getEmitterOptions(rootUrl: string, tempRoot: string, emitter: string, saveInputs: boolean): Promise<Record<string, Record<string, unknown>>> {
  // TODO: Add a way to specify emitter options like Language-Settings.ps1, could be a languageSettings.ts file
  // Method signature should just include the rootUrl. Everything else should be included in the languageSettings.ts file
  const configData = await readFile(path.join(tempRoot, "tspconfig.yaml"), "utf8");
  const configYaml = parseYaml(configData);
  let emitterOptions: Record<string, Record<string, unknown>> = {};
  if (configYaml["options"] && configYaml["options"][emitter]){
    emitterOptions[emitter] = configYaml["options"][emitter];
    emitterOptions[emitter]!["emitter-output-dir"] = rootUrl;
    for (const key in emitterOptions[emitter]!) {
      Object.keys(emitterOptions![emitter]!).forEach(
        (k) => {
          if (`{${k}}` === emitterOptions[emitter]![key]) {
            emitterOptions[emitter]![key] = emitterOptions[emitter]![k];
          }
        });
    }
  } else {
    emitterOptions[emitter] = {
      "emitter-output-dir": rootUrl,
    };
  }
  if (saveInputs) {
    emitterOptions[emitter]!["save-inputs"] = true;
  }
  Logger.debug(`Using emitter options: ${JSON.stringify(emitterOptions)}`);
  return emitterOptions;
}

async function resolveTspConfigUrl(configUrl: string): Promise<{
  resolvedUrl: string;
  commit: string;
  repo: string;
  path: string;
}> {
  let resolvedConfigUrl = configUrl;

  const res = configUrl.match('^https://(?<urlRoot>github|raw.githubusercontent).com/(?<repo>[^/]*/azure-rest-api-specs(-pr)?)/(tree/|blob/)?(?<commit>[0-9a-f]{40})/(?<path>.*)/tspconfig.yaml$')
  if (res && res.groups) {
    if (res.groups["urlRoot"]! === "github") {
      resolvedConfigUrl = configUrl.replace("github.com", "raw.githubusercontent.com");
      resolvedConfigUrl = resolvedConfigUrl.replace("/blob/", "/");
    }
    return {
      resolvedUrl: resolvedConfigUrl,
      commit: res.groups!["commit"]!,
      repo: res.groups!["repo"]!,
      path: res.groups!["path"]!,
    }
  } else {
    throw new Error(`Invalid tspconfig.yaml url: ${configUrl}`);
  }
}
async function discoverMainFile(srcDir: string): Promise<string> {
  Logger.debug(`Discovering entry file in ${srcDir}`)
  let entryTsp = "";
  const files = await readdir(srcDir, {recursive: true });
  for (const file of files) {
    if (file.includes("client.tsp") || file.includes("main.tsp")) {
      entryTsp = file;
      Logger.debug(`Found entry file: ${entryTsp}`);
      return entryTsp;
    }
  };
  throw new Error(`No main.tsp or client.tsp found`);
}

async function sdkInit(
  {
    config,
    outputDir,
    emitter,
    commit,
    repo,
    isUrl,
  }: {
    config: string;
    outputDir: string;
    emitter: string;
    commit: string | undefined;
    repo: string | undefined;
    isUrl: boolean;
  }): Promise<string> {
  if (isUrl) {
    // URL scenario
    const resolvedConfigUrl = await resolveTspConfigUrl(config);
    Logger.debug(`Resolved config url: ${resolvedConfigUrl.resolvedUrl}`)
    const tspConfig = await fetch(resolvedConfigUrl.resolvedUrl);
    const configYaml = parseYaml(tspConfig);
    if (configYaml["parameters"] && configYaml["parameters"]["service-dir"]){
      const serviceDir = configYaml["parameters"]["service-dir"]["default"];
      Logger.debug(`Service directory: ${serviceDir}`)
      let additionalDirs: string[] = [];
      if (configYaml["parameters"]["dependencies"] && configYaml["parameters"]["dependencies"]["additionalDirectories"]) {
        additionalDirs = configYaml["parameters"]["dependencies"]["additionalDirectories"];
      }
      let packageDir: string | undefined = undefined;
      if (configYaml["options"][emitter] && configYaml["options"][emitter]["package-dir"]) {
        packageDir = configYaml["options"][emitter]["package-dir"];
      }
      if (packageDir === undefined) {
        throw new Error(`Missing package-dir in ${emitter} options of tspconfig.yaml. Please refer to https://github.com/Azure/azure-rest-api-specs/blob/main/specification/contosowidgetmanager/Contoso.WidgetManager/tspconfig.yaml for the right schema.`);
      }
      const newPackageDir = path.join(outputDir, serviceDir, packageDir)
      await mkdir(newPackageDir, { recursive: true });
      await writeFile(
        path.join(newPackageDir, "tsp-location.yaml"),
      `directory: ${resolvedConfigUrl.path}\ncommit: ${resolvedConfigUrl.commit}\nrepo: ${resolvedConfigUrl.repo}\nadditionalDirectories: ${additionalDirs}`);
      return newPackageDir;
    } else {
      Logger.error("Missing service-dir in parameters section of tspconfig.yaml. Please refer to https://github.com/Azure/azure-rest-api-specs/blob/main/specification/contosowidgetmanager/Contoso.WidgetManager/tspconfig.yaml for the right schema.")
    }
  } else {
    // Local directory scenario
    let configFile = path.join(config, "tspconfig.yaml")
    const data = await readFile(configFile, "utf8");
    const configYaml = parseYaml(data);
    if (configYaml["parameters"] && configYaml["parameters"]["service-dir"]) {
      const serviceDir = configYaml["parameters"]["service-dir"]["default"];
      var additionalDirs: string[] = [];
      if (configYaml["parameters"]["dependencies"] && configYaml["parameters"]["dependencies"]["additionalDirectories"]) {
        additionalDirs = configYaml["parameters"]["dependencies"]["additionalDirectories"];
      }
      Logger.info(`Additional directories: ${additionalDirs}`)
      let packageDir: string | undefined = undefined;
      if (configYaml["options"][emitter] && configYaml["options"][emitter]["package-dir"]) {
        packageDir = configYaml["options"][emitter]["package-dir"];
      }
      if (packageDir === undefined) {
        throw new Error(`Missing package-dir in ${emitter} options of tspconfig.yaml. Please refer to https://github.com/Azure/azure-rest-api-specs/blob/main/specification/contosowidgetmanager/Contoso.WidgetManager/tspconfig.yaml for the right schema.`);
      }
      const newPackageDir = path.join(outputDir, serviceDir, packageDir)
      await mkdir(newPackageDir, { recursive: true });
      configFile = configFile.replaceAll("\\", "/");
      const matchRes = configFile.match('.*/(?<path>specification/.*)/tspconfig.yaml$')
      var directory = "";
      if (matchRes) {
        if (matchRes.groups) {
          directory = matchRes.groups!["path"]!;
        }
      }
      writeFile(path.join(newPackageDir, "tsp-location.yaml"),
            `directory: ${directory}\ncommit: ${commit}\nrepo: ${repo}\nadditionalDirectories: ${additionalDirs}`);
      return newPackageDir;
    }
    throw new Error("Missing service-dir in parameters section of tspconfig.yaml. Please refer to  https://github.com/Azure/azure-rest-api-specs/blob/main/specification/contosowidgetmanager/Contoso.WidgetManager/tspconfig.yaml for the right schema.")
  }
  throw new Error("Invalid tspconfig.yaml");  
}

async function syncTspFiles(outputDir: string) {
  const tempRoot = await createTempDirectory(outputDir);

  const repoRoot = getRepoRoot();
  Logger.debug(`Repo root is ${repoRoot}`);
  if (repoRoot === undefined) {
    throw new Error("Could not find repo root");
  }

  const cloneDir = path.join(repoRoot, "..", "sparse-spec");
  Logger.debug(`Cloning repo to ${cloneDir}`);
  const [ directory, commit, repo, additionalDirectories ] = await readTspLocation(outputDir);
  const dirSplit = directory.split("/");
  let projectName = dirSplit[dirSplit.length - 1];
  Logger.debug(`Using project name: ${projectName}`)
  if (projectName === undefined) {
    projectName = "src";
  }
  const srcDir = path.join(tempRoot, projectName);
  mkdir(srcDir, { recursive: true });
  await cloneRepo(tempRoot, cloneDir, `https://github.com/${repo}.git`);
  await sparseCheckout(cloneDir);
  await addSpecFiles(cloneDir, directory)
  Logger.info(`Processing additional directories: ${additionalDirectories}`)
  for (const dir of additionalDirectories) {
    await addSpecFiles(cloneDir, dir);
  }
  await checkoutCommit(cloneDir, commit);
  
  await cp(path.join(cloneDir, directory), srcDir, { recursive: true });
  const emitterPath = path.join(repoRoot, "eng", "emitter-package.json");
  await cp(emitterPath, path.join(srcDir, "package.json"), { recursive: true });
  for (const dir of additionalDirectories) {
    const dirSplit = dir.split("/");
    let projectName = dirSplit[dirSplit.length - 1];
    if (projectName === undefined) {
      projectName = "src";
    }
    const dirName = path.join(tempRoot, projectName);
    await cp(path.join(cloneDir, dir), dirName, { recursive: true });
  }
  const emitterPackage = await getEmitterFromRepoConfig(emitterPath);
  if (!emitterPackage) {
    throw new Error("emitterPackage is undefined");
  }
  Logger.debug(`Removing sparse-checkout directory ${cloneDir}`);
  await removeDirectory(cloneDir);
}


async function generate({
  rootUrl,
  noCleanup,
}: {
  rootUrl: string;
  noCleanup: boolean;
}) {
  const tempRoot = path.join(rootUrl, "TempTypeSpecFiles");
  const tspLocation = await readTspLocation(rootUrl);
  const dirSplit = tspLocation[0].split("/");
  let projectName = dirSplit[dirSplit.length - 1];
  if (projectName === undefined) {
    throw new Error("cannot find project name");
  }
  const srcDir = path.join(tempRoot, projectName);
  const emitter = await getEmitterFromRepoConfig(path.join(getRepoRoot(), "eng", "emitter-package.json"));
  if (!emitter) {
    throw new Error("emitter is undefined");
  }
  const mainFilePath = await discoverMainFile(srcDir);
  const resolvedMainFilePath = path.join(srcDir, mainFilePath);
  Logger.info(`Compiling tsp using ${emitter}...`);
  const emitterOptions = await getEmitterOptions(rootUrl, srcDir, emitter, noCleanup);

  Logger.info("Installing dependencies from npm...");
  await installDependencies(srcDir);

  await compileTsp({ emitterPackage: emitter, outputPath: rootUrl, resolvedMainFilePath, options: emitterOptions });

  if (noCleanup) {
    Logger.debug(`Skipping cleanup of temp directory: ${tempRoot}`);
  } else {
    Logger.debug("Cleaning up temp directory");
    await removeDirectory(tempRoot);
  }
}

async function syncAndGenerate({
  outputDir,
  noCleanup,
}: {
  outputDir: string;
  noCleanup: boolean;
}) {
  await syncTspFiles(outputDir);
  await generate({ rootUrl: outputDir, noCleanup});
}

async function main() {
  const options = await getOptions();
  if (options.debug) {
    enableDebug();
  }
  printBanner();
  await printVersion();

  let rootUrl = path.resolve(".");
  if (options.outputDir) {
    rootUrl = path.resolve(options.outputDir);
  }

  switch (options.command) {
      case "init":
        const emitter = await getEmitterFromRepoConfig(path.join(getRepoRoot(), "eng", "emitter-package.json"));
        if (!emitter) {
          throw new Error("Couldn't find emitter-package.json in the repo");
        }
        const outputDir = await sdkInit({config: options.tspConfig!, outputDir: rootUrl, emitter, commit: options.commit, repo: options.repo, isUrl: options.isUrl});
        Logger.info(`SDK initialized in ${outputDir}`);
        if (!options.skipSyncAndGenerate) {
          await syncAndGenerate({outputDir, noCleanup: options.noCleanup})
        }
        break;
      case "sync":
        syncTspFiles(rootUrl);
        break;
      case "generate":
        generate({ rootUrl, noCleanup: options.noCleanup});
        break;
      case "update":
        // TODO update tsp-location.yaml
        syncAndGenerate({outputDir: rootUrl, noCleanup: options.noCleanup});
        break;
      default:
        Logger.error(`Unknown command: ${options.command}`);
  }
}

main().catch((err) => {
  Logger.error(err);
  process.exit(1);
});
