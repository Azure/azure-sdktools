import { parse, isImportStatement, resolvePath, getDirectoryPath, ResolveCompilerOptionsOptions } from "@typespec/compiler";
import { ModuleResolutionResult, resolveModule, ResolveModuleHost } from "@typespec/compiler/module-resolver";
import { Logger } from "./log.js";
import { readFile, readdir, realpath, stat } from "fs/promises";
import * as path from "node:path";
import { parse as parseYaml } from "yaml";
import { pathToFileURL } from "url";


export interface TspLocation {
  directory: string;
  commit: string;
  repo: string;
  additionalDirectories?: string[];
}

export async function getEmitterOptions(rootUrl: string, tempRoot: string, emitter: string, saveInputs: boolean, additionalOptions?: string): Promise<Record<string, any>> {
  // TODO: Add a way to specify emitter options like Language-Settings.ps1, could be a languageSettings.ts file
  let emitterOptions: Record<string, Record<string, unknown>> = {};
  emitterOptions[emitter] = {};
  if (additionalOptions) {
    emitterOptions = resolveCliOptions(additionalOptions.split(","));
  } else {
    const configData = await readFile(path.join(tempRoot, "tspconfig.yaml"), "utf8");
    const configYaml = parseYaml(configData);
    emitterOptions[emitter] = configYaml?.options?.[emitter];
    // TODO: This accounts for a very specific and common configuration in the tspconfig.yaml files,
    // we should consider making this more generic.
    Object.keys(emitterOptions[emitter]!).forEach((key) => {
      if (emitterOptions![emitter]![key] === "{package-dir}") {
        emitterOptions![emitter]![key] = emitterOptions![emitter]!["package-dir"];
      }
    });
  }
  if (!emitterOptions?.[emitter]?.["emitter-output-dir"]) {
    emitterOptions[emitter]!["emitter-output-dir"] = rootUrl;
  }
  if (saveInputs) {
    if (!emitterOptions[emitter]) {
      emitterOptions[emitter] = {};
    }
    emitterOptions[emitter]!["save-inputs"] = true;
  }
  Logger.debug(`Using emitter options: ${JSON.stringify(emitterOptions)}`);
  return emitterOptions;
}

export function resolveCliOptions(opts: string[]): Record<string, Record<string, unknown>> {
  const options: Record<string, Record<string, string>> = {};
  for (const option of opts ?? []) {
    const optionParts = option.split("=");
    if (optionParts.length !== 2) {
      throw new Error(
        `The --option parameter value "${option}" must be in the format: <emitterName>.some-options=value`
      );
    }
    let optionKeyParts = optionParts[0]!.split(".");
    if (optionKeyParts.length > 2) {
      // support emitter/path/file.js.option=xyz
      optionKeyParts = [
        optionKeyParts.slice(0, -1).join("."),
        optionKeyParts[optionKeyParts.length - 1]!,
      ];
    }
    let emitterName = optionKeyParts[0];
    emitterName = emitterName?.replace(".", "/")
    const key = optionKeyParts[1];
    if (!(emitterName! in options)) {
      options[emitterName!] = {};
    }
    options[emitterName!]![key!] = optionParts[1]!;
  }
  return options;
}


export function resolveTspConfigUrl(configUrl: string): {
  resolvedUrl: string;
  commit: string;
  repo: string;
  path: string;
} {
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


export async function discoverMainFile(srcDir: string): Promise<string> {
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

export async function resolveImports(file: string): Promise<string[]> {
  const imports: string[] = [];
  const node = await parse(file);
  for (const statement of node.statements) {
    if (isImportStatement(statement)) {
      imports.push(statement.path.value);
    }
  }
  return imports;
}

export async function compileTsp({
  emitterPackage,
  outputPath,
  resolvedMainFilePath,
  saveInputs,
}: {
  emitterPackage: string;
  outputPath: string;
  resolvedMainFilePath: string;
  saveInputs?: boolean;
}) {
  const parsedEntrypoint = getDirectoryPath(resolvedMainFilePath);
  const { compile, NodeHost, getSourceLocation, resolveCompilerOptions } = await importTsp(parsedEntrypoint);

  const outputDir = resolvePath(outputPath);
  const overrideOptions: Record<string, Record<string, string>> = {};
  overrideOptions[emitterPackage] = {"emitter-output-dir": outputDir}
  if (saveInputs) {
    overrideOptions[emitterPackage]!["save-inputs"] = "true";
  }
  const overrides: Partial<ResolveCompilerOptionsOptions["overrides"]> = {
    outputDir,
    emit: [emitterPackage],
    options: overrideOptions,
  };
  Logger.info(`Compiling tsp using ${emitterPackage}...`);
  const [options, diagnostics] = await resolveCompilerOptions(NodeHost, {
    cwd: process.cwd(),
    entrypoint: resolvedMainFilePath,
    overrides,
  });

  if (diagnostics.length > 0) {
    // This should not happen, but if it does, we should log it.
    Logger.debug(`Compiler options diagnostic information: ${JSON.stringify(diagnostics)}`);
  }

  const program = await compile(NodeHost, resolvedMainFilePath, options);

  if (program.diagnostics.length > 0) {
    for (const diagnostic of program.diagnostics) {
      const location = getSourceLocation(diagnostic.target);
      const source = location ? location.file.path : "unknown";
      console.error(
        `${diagnostic.severity}: ${diagnostic.code} - ${diagnostic.message} @ ${source}`,
      );
    }
  } else {
    Logger.success("generation complete");
  }
}

export async function importTsp(baseDir: string): Promise<typeof import("@typespec/compiler")> {
  try {
    const host: ResolveModuleHost = {
      realpath,
      readFile: async (path: string) => await readFile(path, "utf-8"),
      stat,
    };
    const resolved: ModuleResolutionResult = await resolveModule(host, "@typespec/compiler", {
      baseDir,
    });

    Logger.info(`Resolved path: ${resolved.path}`);

    if (resolved.type === "module") {
      return import(pathToFileURL(resolved.mainFile).toString());
    }
    return import(pathToFileURL(resolved.path).toString());
  } catch (err: any) {
    if (err.code === "MODULE_NOT_FOUND") {
      // Resolution from cwd failed: use current package.
      return import("@typespec/compiler");
    } else {
      throw err;
    }
  }
}
