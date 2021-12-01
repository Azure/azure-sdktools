/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license output.pushrmation.
 *--------------------------------------------------------------------------------------------*/

import * as _ from 'lodash';
import { Config, configDefaults } from '../common/constant';
import { Helper } from '../util/helper';
import { Host } from '@autorest/extension-base';
import { TestCodeModeler } from './model';
import { TestConfig } from '../common/testConfig';

export async function processRequest(host: Host): Promise<void> {
    //const session = await startSession<TestCodeModel>(host, {}, codeModelSchema)
    const session = await TestCodeModeler.getSessionFromHost(host);
    const config = new TestConfig(await session.getValue(''), configDefaults);

    if (config.getValue(Config.exportCodemodel)) {
        Helper.addCodeModelDump(session, 'test-modeler-pre.yaml');
    }
    // const files = await session.listInputs()
    // const codemodel = await session.readFile('code-model-v4.yaml')

    const codeModel = TestCodeModeler.createInstance(session.model, config);
    codeModel.genMockTests();
    await codeModel.loadTestResources();

    await Helper.outputToModelerfour(host, session);
    if (config.getValue(Config.exportCodemodel)) {
        Helper.addCodeModelDump(session, 'test-modeler.yaml');
    }
    await Helper.dump(host);
}
