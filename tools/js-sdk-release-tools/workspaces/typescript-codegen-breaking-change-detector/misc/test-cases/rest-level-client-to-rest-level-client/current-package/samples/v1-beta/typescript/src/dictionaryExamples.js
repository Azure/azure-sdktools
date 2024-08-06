"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const tslib_1 = require("tslib");
/**
 * @summary This sample demonstrates how to make a simple call to the Azure Text Translator service to get grammatical structure and context examples for the source term and target term pair.
 */
const ai_translation_text_1 = tslib_1.__importStar(require("@azure-rest/ai-translation-text"));
const dotenv = tslib_1.__importStar(require("dotenv"));
dotenv.config();
const endpoint = process.env["ENDPOINT"] || "https://api.cognitive.microsofttranslator.com";
const apiKey = process.env["TEXT_TRANSLATOR_API_KEY"] || "<api key>";
const region = process.env["TEXT_TRANSLATOR_REGION"] || "<region>";
async function main() {
    console.log("== Dictionary Examples sample ==");
    const translateCedential = {
        key: apiKey,
        region
    };
    const translationClient = (0, ai_translation_text_1.default)(endpoint, translateCedential);
    const inputText = [{ text: "fly", translation: "volar" }];
    const dictionaryResponse = await translationClient.path("/dictionary/examples").post({
        body: inputText,
        queryParameters: {
            to: "es",
            from: "en",
        }
    });
    if ((0, ai_translation_text_1.isUnexpected)(dictionaryResponse)) {
        throw dictionaryResponse.body.error;
    }
    const dictionaryExamples = dictionaryResponse.body;
    for (const dictionaryExample of dictionaryExamples) {
        console.log(`For the given input ${dictionaryExample?.examples?.length} examples were found in the dictionary.`);
        const firstExample = dictionaryExample?.examples[0];
        console.log(`Example: '${firstExample.targetPrefix + firstExample.targetTerm + firstExample.targetSuffix}'.`);
    }
}
main().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=dictionaryExamples.js.map