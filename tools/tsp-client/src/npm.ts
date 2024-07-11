import { writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { joinPaths } from "@typespec/compiler";

export async function createPackageJson(rootPath: string, deps: Set<string>): Promise<void> {
  const dependencies: Record<string, string> = {};

  for (const dep of deps) {
    dependencies[dep] = "latest";
  }

  const packageJson = JSON.stringify({
    dependencies,
  });

  const filePath = joinPaths(rootPath, "package.json");
  await writeFile(filePath, packageJson);
}

export async function npmCommand(workingDir: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const npm = spawn("npm", args, {
      cwd: workingDir,
      stdio: "inherit",
      shell: true,
    });
    npm.once("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`npm ${args[0]} failed exited with code ${code}`));
      }
    });
    npm.once("error", (err) => {
      reject(new Error(`npm ${args[0]} failed with error: ${err}`));
    });
  });
}

export async function npxCommand(workingDir: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const npm = spawn("npx", args, {
      cwd: workingDir,
      stdio: "inherit",
      shell: true,
    });
    npm.once("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`npx ${args[0]} failed exited with code ${code}`));
      }
    });
    npm.once("error", (err) => {
      reject(new Error(`npx ${args[0]} failed with error: ${err}`));
    });
  });
}
