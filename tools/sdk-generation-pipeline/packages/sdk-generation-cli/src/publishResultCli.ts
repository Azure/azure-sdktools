#!/usr/bin/env node
import * as fs from 'fs';
import {
    AzureSDKTaskName,
    BlobBasicContext,
    CodeGeneration,
    CompletedEvent,
    InProgressEvent,
    logger,
    MongoConnectContext,
    QueuedEvent,
    requireJsonc,
    ResultBlobPublisher,
    ResultEventhubPublisher,
    ResultDBPublisher,
    SDKPipelineStatus,
    StorageType,
    TaskResult,
    Trigger,
} from '@azure-tools/sdk-generation-lib';

import {
    resultPublisherBlobInput,
    ResultPublisherBlobInput,
    resultPublisherDBCGInput,
    ResultPublisherDBCGInput,
    resultPublisherDBResultInput,
    ResultPublisherDBResultInput,
    resultPublisherEventHubInput,
    ResultPublisherEventHubInput,
} from './cliSchema/publishResultConfig';

async function publishBlob() {
    resultPublisherBlobInput.validate();
    const config: ResultPublisherBlobInput = resultPublisherBlobInput.getProperties();
    const context: BlobBasicContext = {
        pipelineBuildId: config.pipelineBuildId,
        sdkGenerationName: config.sdkGenerationName,
        azureStorageBlobSasUrl: config.azureStorageBlobSasUrl,
        azureBlobContainerName: config.azureBlobContainerName,
    };
    const resultBlobPublisher: ResultBlobPublisher = new ResultBlobPublisher(context);
    await resultBlobPublisher.uploadLogsAndResult(config.logsAndResultPath, config.taskName as AzureSDKTaskName);
}

function initCodegen(config: ResultPublisherDBCGInput, pipelineStatus: SDKPipelineStatus): CodeGeneration {
    const cg: CodeGeneration = new CodeGeneration();
    cg.name = config.sdkGenerationName;
    cg.service = config.service;
    cg.serviceType = config.serviceType;
    cg.tag = config.tag;
    cg.sdk = config.language;
    cg.swaggerRepo = config.swaggerRepo;
    cg.sdkRepo = config.sdkRepo;
    cg.codegenRepo = config.codegenRepo;
    cg.owner = config.owner ? config.owner : '';
    cg.type = config.triggerType;
    cg.status = pipelineStatus;
    cg.lastPipelineBuildID = config.pipelineBuildId;
    cg.swaggerPR = config.swaggerRepo;

    return cg;
}

function initMongoConnectContext(config: ResultPublisherDBCGInput): MongoConnectContext {
    const mongoConnectContext: MongoConnectContext = {
        name: 'mongodb',
        type: 'mongodb',
        host: config.mongodb.server,
        port: config.mongodb.port,
        username: config.mongodb.username,
        password: config.mongodb.password,
        database: config.mongodb.database,
        ssl: config.mongodb.ssl,
        synchronize: true,
        logging: true,
    };

    return mongoConnectContext;
}

async function publishDB(pipelineStatus: SDKPipelineStatus) {
    resultPublisherDBCGInput.validate();
    const config: ResultPublisherDBCGInput = resultPublisherDBCGInput.getProperties();
    const publisher: ResultDBPublisher = new ResultDBPublisher();
    const cg: CodeGeneration = initCodegen(config, pipelineStatus);
    const mongoConnectContext: MongoConnectContext = initMongoConnectContext(config);

    await publisher.connectDB(mongoConnectContext);
    await publisher.sendSdkGenerationToDB(cg);

    if (pipelineStatus === 'completed') {
        resultPublisherDBResultInput.validate();
        const resultConfig: ResultPublisherDBResultInput = resultPublisherDBResultInput.getProperties();
        const taskResultsPathArray = JSON.parse(resultConfig.taskResultsPath);
        const taskResults: TaskResult[] = [];

        for (const taskResultPath of taskResultsPathArray) {
            if (fs.existsSync(taskResultPath)) {
                taskResults.push(requireJsonc(taskResultPath));
            } else {
                logger.error(`SendSdkGenerationToDB failed !, ${taskResultPath} isn't exist`);
            }
        }

        await publisher.sendSdkTaskResultToDB(resultConfig.pipelineBuildId, taskResults);
    }

    await publisher.close();
}

function getTrigger(config: ResultPublisherEventHubInput): Trigger {
    let trigger: Trigger = JSON.parse(config.trigger);

    return trigger;
}

async function publishEventhub(pipelineStatus: SDKPipelineStatus) {
    resultPublisherEventHubInput.validate();
    const config: ResultPublisherEventHubInput = resultPublisherEventHubInput.getProperties();
    let trigger: Trigger = getTrigger(config);

    const publisher: ResultEventhubPublisher = new ResultEventhubPublisher(config.eventHubConnectionString);

    switch (pipelineStatus) {
        case 'queued':
            await publisher.publishEvent({
                status: 'queued',
                trigger: trigger,
                pipelineBuildId: config.pipelineBuildId,
            } as QueuedEvent);
            break;
        case 'in_progress':
            await publisher.publishEvent({
                status: 'in_progress',
                trigger: trigger,
                pipelineBuildId: config.pipelineBuildId,
            } as InProgressEvent);
            break;
        case 'completed':
            if (!config.resultPath || !config.logPath || !fs.existsSync(config.resultPath)) {
                throw new Error(`Invalid completed event parameter!`);
            }
            const taskResult: TaskResult = requireJsonc(config.resultPath);
            await publisher.publishEvent({
                status: 'completed',
                trigger: trigger,
                pipelineBuildId: config.pipelineBuildId,
                logPath: config.logPath,
                result: taskResult,
            } as CompletedEvent);
            break;
    }
    await publisher.close();
}

async function main() {
    const args = parseArgs(process.argv);
    const storageType = args['storageType'];
    const pipelineStatus = args['pipelineStatus'];

    switch (storageType as StorageType) {
        case StorageType.Blob:
            await publishBlob();
            break;
        case StorageType.Db:
            await publishDB(pipelineStatus);
            break;
        case StorageType.EventHub:
            await publishEventhub(pipelineStatus);
            break;
        default:
            throw new Error(`Unknown storageType:${storageType}!`);
    }
}

/**
 * Parse a list of command line arguments.
 * @param argv List of cli args(process.argv)
 */
const flagRegex = /^--([^=:]+)([=:](.+))?$/;
export function parseArgs(argv: string[]) {
    const result: any = {};
    for (const arg of argv) {
        const match = flagRegex.exec(arg);
        if (match) {
            const key = match[1];
            const rawValue = match[3];
            result[key] = rawValue;
        }
    }
    return result;
}

main().catch((e) => {
    logger.error(`${e.message}
    ${e.stack}`);
    process.exit(1);
});
