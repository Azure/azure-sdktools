import { NodeHost, compile, getSourceLocation } from "@typespec/compiler";
import { parse, isImportStatement } from "@typespec/compiler";
import * as path from "node:path";
import { Logger } from "./log.js";
import { getEmitterOutputPath } from "./languageSettings.js";

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
  language,
  emitterPackage,
  emitterOutputPath,
  resolvedMainFilePath,
  tempRoot,
}: {
  language: string;
  emitterPackage: string;
  emitterOutputPath: string;
  resolvedMainFilePath: string;
  tempRoot: string;
}) {
  const emitterOutputDir = getEmitterOutputPath(language, emitterOutputPath);
  Logger.debug(`Using emitter output dir: ${emitterOutputDir}`);
  // compile the local copy of the root file
  const program = await compile(NodeHost, resolvedMainFilePath, {
    outputDir: path.join(tempRoot, "output"),
    emit: [emitterPackage],
    options: {
      [emitterPackage]: {
        "emitter-output-dir": emitterOutputDir,
      },
    },
  });

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
