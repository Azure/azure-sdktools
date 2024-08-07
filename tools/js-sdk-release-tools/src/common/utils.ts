import shell from 'shelljs';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { SDKType } from './types';
import { logger } from '../utils/logger';
import { Project, ScriptTarget, SourceFile } from 'ts-morph';
import { replaceAll } from '@ts-common/azure-js-dev-tools';
import { access } from 'node:fs/promises';
import { SpawnOptions } from 'child_process';
import { outputFile } from 'fs-extra';

function printErrorDetails(output: { stdout: string; stderr: string, code: number | null } | undefined) {
    logger.logError(`Error details:`);
    if (!output) return;
    logger.logError(output?.stderr);
    logger.logError(output?.stdout);
}

export const runCommandOptions: SpawnOptions = { shell: true, stdio: ['inherit', 'pipe', 'pipe'] };

export function getClassicClientParametersPath(packageRoot: string): string {
    return path.join(packageRoot, 'src', 'models', 'parameters.ts');
}

export function getSDKType(packageRoot: string): SDKType {
    const paraPath = getClassicClientParametersPath(packageRoot);
    const exist = shell.test('-e', paraPath);
    const type = exist ? SDKType.HighLevelClient : SDKType.ModularClient;
    logger.logInfo(`SDK type: ${type} detected in ${packageRoot}`);
    return type;
}

export function getNpmPackageName(packageRoot: string): string {
    const packageJsonPath = path.join(packageRoot, 'package.json');
    const packageJson = fs.readFileSync(packageJsonPath, { encoding: 'utf-8' });
    const packageName = JSON.parse(packageJson).name;
    return packageName;
}

export function getApiReviewPath(packageRoot: string): string {
    const sdkType = getSDKType(packageRoot);
    const reviewDir = path.join(packageRoot, 'review');
    switch (sdkType) {
        case SDKType.ModularClient:
            const npmPackageName = getNpmPackageName(packageRoot);
            const packageName = npmPackageName.substring('@azure/'.length);
            const apiViewFileName = `${packageName}.api.md`;
            return path.join(packageRoot, 'review', apiViewFileName);
        case SDKType.HighLevelClient:
        case SDKType.RestLevelClient:
        default:
            // only one xxx.api.md
            return path.join(packageRoot, 'review', fs.readdirSync(reviewDir)[0]);
    }
}

export function getTsSourceFile(filePath: string): SourceFile | undefined {
    const target = ScriptTarget.ES2015;
    const compilerOptions = { target };
    const project = new Project({ compilerOptions });
    project.addSourceFileAtPath(filePath);
    return project.getSourceFile(filePath);
}

// changelog policy: https://aka.ms/azsdk/guideline/changelogs
export function fixChangelogFormat(content: string) {
    content = replaceAll(content, '**Features**', '### Features Added')!;
    content = replaceAll(content, '**Breaking Changes**', '### Breaking Changes')!;
    content = replaceAll(content, '**Bugs Fixed**', '### Bugs Fixed')!;
    content = replaceAll(content, '**Other Changes**', '### Other Changes')!;
    return content;
}

export function tryReadNpmPackageChangelog(packageFolderPath: string): string {
    const changelogPath = path.join(packageFolderPath, 'changelog-temp', 'package', 'CHANGELOG.md');
    try {
        if (!fs.existsSync(changelogPath)) {
            logger.logWarn(`NPM package's changelog "${changelogPath}" does not exists`);
            return '';
        }
        const originalChangeLogContent = fs.readFileSync(changelogPath, { encoding: 'utf-8' });
        return originalChangeLogContent;
    } catch (err) {
        logger.logWarn(`Failed to read NPM package's changelog "${changelogPath}": ${(err as Error)?.stack ?? err}`);
        return '';
    }
}

export async function existsAsync(path: string): Promise<boolean> {
    try {
        await access(path);
        return true;
    } catch (error) {
        logger.logWarn(`Fail to find ${path} for error: ${error}`);
        return false;
    }
}

export function runCommand(
    command: string,
    args: readonly string[],
    options: SpawnOptions,
    realtimeOutput: boolean = true,
    timeoutSeconds: number | undefined = undefined 
): Promise<{ stdout: string; stderr: string, code }> {
    return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        const commandStr = `${command} ${args.join(' ')}`;
        logger.logInfo(`Run command: ${commandStr}`);
        const child = spawn(command, args, options);

        let timedOut = false;
        const timer = timeoutSeconds &&setTimeout(() => {
            timedOut = true;
            child.kill();
            reject(new Error(`Process timed out after ${timeoutSeconds}s`));
        }, timeoutSeconds * 1000);
        
        child.stdout?.on('data', (data) => {
            const str = data.toString();
            stdout += str;
            if (realtimeOutput) logger.logInfo(str);
        });

        child.stderr?.on('data', (data) => {
            const str = data.toString();
            stderr += str;
            if (realtimeOutput) console.error(str);
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr, code });
            } else {
                logger.logError(`Run command closed with code ${code}`);
                printErrorDetails({ stdout, stderr, code });
                reject(new Error(`Run command closed with code ${code}`));
            }
        });

        child.on('exit', (code, signal) => {
            if (timer) clearTimeout(timer);
            if (!timedOut) {
              if (signal || code && code !== 0) {
                logger.logError(`Command "${commandStr}" exited with signal: ${signal} and code: ${code}`);
                printErrorDetails({ stdout, stderr, code });
                reject(new Error(`Process was killed with signal: ${signal}`));
              } else {
                  resolve({ stdout, stderr, code });
              }
            }
        });

        child.on('error', (err) => {
            logger.logError(`Received command error: ${(err as Error)?.stack ?? err}`);
            printErrorDetails({ stdout, stderr, code: null });
            reject(err);
        });
    });
}
