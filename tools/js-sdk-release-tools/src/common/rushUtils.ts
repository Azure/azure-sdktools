import { CommentArray, CommentJSONValue, CommentObject, assign, parse, stringify } from 'comment-json';
import { access, readFile, writeFile } from 'node:fs/promises';
import { basename, join, posix } from 'node:path';
import { getArtifactName, getNpmPackageInfo } from './npmUtils';
import { PackageResult, VersionPolicyName } from './types';
import { runCommand, runCommandOptions } from './utils';

import { copy, ensureDir } from 'fs-extra';
import { glob } from 'glob';
import { logger } from '../utils/logger';

interface ProjectItem {
    packageName: string;
    projectFolder: string;
    versionPolicyName: string;
}

let x = '';

async function updateRushJson(projectItem: ProjectItem) {
    const content = await readFile('rush.json', { encoding: 'utf-8' });
    const rushJson = parse(content.toString());
    const projects = (rushJson as CommentObject)?.['projects'] as CommentArray<CommentJSONValue>;
    if (!projects) {
        throw new Error('Failed to parse projects in rush.json.');
    }
    const isCurrentPackageExist = projects.filter((p) => p?.['packageName'] === projectItem.packageName).length > 0;
    if (isCurrentPackageExist) {
        logger.info(`${projectItem.packageName} exists, no need to update rush.json.`);
        return;
    }
    // add new project and keep comment at the same time
    const newProjects = assign(projects, [...projects, projectItem]);
    const newRushJson = assign(rushJson, { ...(rushJson as CommentObject), projects: newProjects });
    const newRushJsonContent = stringify(newRushJson, undefined, 2);
    writeFile('rush.json', newRushJsonContent, { encoding: 'utf-8' });
    logger.info('Updated rush.json successfully.');
}

async function packPackage(packageDirectory: string) {
    const cwd = join(packageDirectory);
    logger.info(`Start to run rushx pack.`);
    // TODO: use node common/scripts/install-run-rush.js pack --to ${packageName} --verbose
    await runCommand('rushx', ['pack'], { ...runCommandOptions, cwd, stdio: ['pipe', 'pipe', 'pipe'] }, false);
    logger.info(`rushx pack successfully.`);
}

async function addApiViewInfo(relativePackageDirectoryToSdkRoot: string, packageResult: PackageResult) {
    const apiViewPathPattern = posix.join(relativePackageDirectoryToSdkRoot, 'temp', '**/*.api.json');
    const apiViews = await glob(apiViewPathPattern);
    if (!apiViews || apiViews.length === 0) throw new Error(`Failed to get API views.`);
    if (apiViews && apiViews.length > 1) throw new Error(`Failed to get exactly one API view: ${apiViews}.`);
    await ensureDir('~/.api-views-temp');
    const apiViewName = basename(apiViews[0]);
    const apiViewPath = join('~/.api-views-temp', apiViewName);
    await copy(apiViews[0], apiViewPath);
    packageResult.apiViewArtifact = apiViewPath;
}

export async function buildPackage(
    relativePackageDirectoryToSdkRoot: string,
    versionPolicyName: VersionPolicyName,
    packageResult: PackageResult
) {
    logger.info(`Start building package in ${relativePackageDirectoryToSdkRoot}.`);
    const { name } = await getNpmPackageInfo(relativePackageDirectoryToSdkRoot);
    await updateRushJson({
        packageName: name,
        projectFolder: relativePackageDirectoryToSdkRoot,
        versionPolicyName: versionPolicyName
    });
    // TODO: use rush script
    await runCommand(`rush`, ['update'], { ...runCommandOptions, stdio: ['pipe', 'pipe', 'pipe'] }, false);
    logger.info(`Rush update successfully.`);
    await runCommand('rush', ['build', '-t', name, '--verbose'], runCommandOptions);
    await addApiViewInfo(relativePackageDirectoryToSdkRoot, packageResult);
    logger.info(`Build package "${name}" successfully.`);
}

// no exception will be thrown, since we don't want it stop sdk generation. sdk author will need to resolve the failure
export async function tryBuildSamples(packageDirectory: string) {
    logger.info(`Start to build samples in ${packageDirectory}.`);
    const cwd = join(packageDirectory);
    const options = { ...runCommandOptions, cwd };
    let output: { stdout: string; stderr: string } | undefined;
    try {
        await runCommand(`rushx`, ['build:samples'], options, false, 300);
        logger.info(`built samples successfully.`);
    } catch (err) {
        logger.error(`Failed to build samples due to: ${(err as Error)?.stack ?? err}`);
    }
}

// no exception will be thrown, since we don't want it stop sdk generation. sdk author will need to resolve the failure
export async function tryTestPackage(packageDirectory: string) {
    logger.info(`Start to test package in ${packageDirectory}.`);
    // debug
    let apiViews = await glob(x);
    console.log('-----------------api views, before test', apiViews, x);

    const env = { ...process.env, TEST_MODE: 'record' };
    const cwd = join(packageDirectory);
    const options = { ...runCommandOptions, env, cwd };
    try {
        await runCommand(`rushx`, ['test:node'], options, true, 300);
        logger.info(`tested package successfully.`);
    } catch (err) {
        logger.error(`Failed to test package due to: ${(err as Error)?.stack ?? err}`);
    }

    // debug
    apiViews = await glob(x);
    console.log('-----------------api views, after test', apiViews, x);
}

export async function createArtifact(packageDirectory: string) {
    logger.info(`Start to create artifact in ${packageDirectory}`);
    await packPackage(packageDirectory);
    const info = await getNpmPackageInfo(packageDirectory);
    const artifactName = getArtifactName(info);
    const artifactPath = posix.join(packageDirectory, artifactName);
    await access(artifactPath);
    logger.info(`Start to create artifact ${info.name} successfully.`);
    return artifactPath;
}
