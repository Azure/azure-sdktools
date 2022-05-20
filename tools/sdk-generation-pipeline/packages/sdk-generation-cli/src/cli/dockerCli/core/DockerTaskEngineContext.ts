import {
    addFileLog,
    CodegenToSdkConfig,
    GenerateAndBuildInput,
    GenerateAndBuildOptions,
    getCodegenToSdkConfig,
    getGenerateAndBuildOutput,
    getTask,
    getTestOutput,
    InitOptions,
    initOutput,
    MockTestInput,
    MockTestOptions,
    removeFileLog,
    requireJsonc,
    runScript,
    StringMap
} from "@azure-tools/sdk-generation-lib";
import { execSync } from "child_process";
import * as fs from "fs";
import { writeFileSync } from "fs";
import * as path from "path";
import { Logger } from "winston";
import { disableFileMode, getHeadRef, getHeadSha, safeDirectory } from "../../../utils/git";
import { dockerTaskEngineInput } from "../schema/dockerTaskEngineInput";
import { DockerContext } from "./DockerContext";
import { GenerateAndBuildTask } from './tasks/GenerateAndBuildTask';
import { InitTask } from './tasks/InitTask';
import { MockTestTask } from './tasks/MockTestTask';
import { SDKGenerationTaskBase } from './tasks/SDKGenerationTaskBase';

export class DockerTaskEngineContext {
    logger: Logger;
    configFilePath: string;
    initOutput: string;
    generateAndBuildInputJson: string;
    generateAndBuildOutputJson: string;
    mockTestInputJson: string;
    mockTestOutputJson: string;
    initTaskLog: string;
    generateAndBuildTaskLog: string;
    mockTestTaskLog: string;
    readmeMdPath: string;
    specRepo: {
        repoPath: string;
        headSha: string;
        headRef: string;
        repoHttpsUrl: string;
    };
    serviceType?: string;
    tag?: string;
    sdkRepo: string;
    resultOutputFolder?: string;
    envs?: StringMap<string | boolean | number>;
    packageFolders?: string[];
    mockServerHost?: string;
    taskResults?: {};
    taskResultJsonPath: string;
    changeOwner: boolean

    public initialize(dockerContext: DockerContext) {
        // before execute task engine, safe spec repos and sdk repos because they may be owned by others
        safeDirectory(dockerContext.specRepo);
        safeDirectory(dockerContext.sdkRepo);
        const dockerTaskEngineConfigProperties = dockerTaskEngineInput.getProperties();
        this.logger = dockerContext.logger;
        this.configFilePath = dockerTaskEngineConfigProperties.configFilePath;
        this.initOutput = path.join(dockerContext.resultOutputFolder, dockerTaskEngineConfigProperties.initOutput);
        this.generateAndBuildInputJson = path.join(dockerContext.resultOutputFolder, dockerTaskEngineConfigProperties.generateAndBuildInputJson);
        this.generateAndBuildOutputJson = path.join(dockerContext.resultOutputFolder, dockerTaskEngineConfigProperties.generateAndBuildOutputJson);
        this.mockTestInputJson = path.join(dockerContext.resultOutputFolder, dockerTaskEngineConfigProperties.mockTestInputJson);
        this.mockTestOutputJson = path.join(dockerContext.resultOutputFolder, dockerTaskEngineConfigProperties.mockTestOutputJson);
        this.initTaskLog = path.join(dockerContext.resultOutputFolder, dockerTaskEngineConfigProperties.initTaskLog);
        this.generateAndBuildTaskLog = path.join(dockerContext.resultOutputFolder, dockerTaskEngineConfigProperties.generateAndBuildTaskLog);
        this.mockTestTaskLog = path.join(dockerContext.resultOutputFolder, dockerTaskEngineConfigProperties.mockTestTaskLog);
        this.readmeMdPath = dockerContext.readmeMdPath;
        this.specRepo = {
                repoPath: dockerContext.specRepo,
                headSha: dockerTaskEngineConfigProperties.headSha ?? getHeadSha(dockerContext.specRepo),
                headRef: dockerTaskEngineConfigProperties.headRef ?? getHeadRef(dockerContext.specRepo),
                repoHttpsUrl: dockerTaskEngineConfigProperties.repoHttpsUrl
        };
        this.serviceType = dockerContext.readmeMdPath.includes('data-plane') && dockerTaskEngineConfigProperties.serviceType ? 'data-plane': 'resource-manager';
        this.tag = dockerContext.tag;
        this.sdkRepo = dockerContext.sdkRepo;
        this.resultOutputFolder = dockerContext.resultOutputFolder ?? '/tmp/output';
        this.mockServerHost = dockerTaskEngineConfigProperties.mockServerHost;
        this.taskResultJsonPath = path.join(dockerContext.resultOutputFolder, dockerTaskEngineConfigProperties.taskResultJson);
        this.changeOwner = dockerTaskEngineConfigProperties.changeOwner

    }

    public async beforeRunTaskEngine() {
        if (!!this.resultOutputFolder && !fs.existsSync(this.resultOutputFolder)) {
            fs.mkdirSync(this.resultOutputFolder, {recursive: true});
        }
        this.logger.info(`Start to run task engine in ${path.basename(this.sdkRepo)}`);
    }

    public async afterRunTaskEngine() {
        if (this.changeOwner && !!this.specRepo?.repoPath && !!fs.existsSync(this.specRepo.repoPath)) {
            const userGroupId = (execSync(`stat -c "%u:%g" ${this.specRepo.repoPath}`, {encoding: "utf8"})).trim();
            if (!!this.resultOutputFolder && fs.existsSync(this.resultOutputFolder)) {
                execSync(`chown -R ${userGroupId} ${this.specRepo.repoPath}`);
            }
            if (!!this.sdkRepo && fs.existsSync(this.sdkRepo)) {
                execSync(`chown -R ${userGroupId} ${this.sdkRepo}`, {encoding: "utf8"});
                disableFileMode(this.sdkRepo);
            }
        }
        if (!!this.taskResults) {
            writeFileSync(this.taskResultJsonPath, JSON.stringify(this.taskResults, undefined, 2), 'utf-8');
        }
        this.logger.info(`Finish running task engine in ${path.basename(this.sdkRepo)}`);
    }

    public async getTaskToRun(): Promise<SDKGenerationTaskBase[]> {
        const codegenToSdkConfig: CodegenToSdkConfig = getCodegenToSdkConfig(requireJsonc(path.join(this.sdkRepo, this.configFilePath)));
        this.logger.info(`Get codegen_to_sdk_config.json`);
        this.logger.info(JSON.stringify(codegenToSdkConfig, undefined, 2));
        const tasksToRun: SDKGenerationTaskBase[] = [];
        for (const taskName of Object.keys(codegenToSdkConfig)) {
            let task: SDKGenerationTaskBase;
            switch (taskName) {
                case 'init':
                    task = new InitTask(this);
                    break;
                case 'generateAndBuild':
                    task = new GenerateAndBuildTask(this);
                    break;
                case 'mockTest':
                    task = new MockTestTask(this);
                    break;
            }

            if (!!task) {
                tasksToRun.push(task);
                if (!this.taskResults) {
                    this.taskResults = {};
                }
                this.taskResults[taskName] = 'skipped';
            }
        }
        tasksToRun.sort((a, b) => a.order - b.order);
        this.logger.info(`Get tasks to run: ${tasksToRun.map(task => task.taskType).join(',')}`);
        return tasksToRun;
    }

    public async runTaskEngine() {
        await this.beforeRunTaskEngine();
        try {
            const tasksToRun: SDKGenerationTaskBase[] = await this.getTaskToRun();
            for (const task of tasksToRun) {
                await task.execute();
            }
        } finally {
            await this.afterRunTaskEngine();
        }
    }
}

