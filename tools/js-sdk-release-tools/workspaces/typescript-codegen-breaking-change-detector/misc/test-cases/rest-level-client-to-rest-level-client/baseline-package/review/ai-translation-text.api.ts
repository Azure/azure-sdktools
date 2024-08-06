import { Client } from '@azure-rest/core-client';
import { ClientOptions } from '@azure-rest/core-client';
import { HttpResponse } from '@azure-rest/core-client';
import { KeyCredential } from '@azure/core-auth';
import { RawHttpHeaders } from '@azure/core-rest-pipeline';
import { RawHttpHeadersInput } from '@azure/core-rest-pipeline';
import { RequestParameters } from '@azure-rest/core-client';
import { StreamableMethod } from '@azure-rest/core-client';
import { TokenCredential } from '@azure/core-auth';

// @public
export interface BackTranslationOutput {
  displayText: string;
  frequencyCount: number;
  normalizedText: string;
  numExamples: number;
}

// @public
export interface BreakSentenceItemOutput {
  detectedLanguage?: DetectedLanguageOutput;
  sentLen: number[];
}

// @public (undocumented)
export function buildMultiCollection(items: string[], parameterName: string): string;

// @public
export interface CommonScriptModelOutput {
  code: string;
  dir: string;
  name: string;
  nativeName: string;
}

// @public
function createClient(
  endpoint: undefined | string,
  credential?: undefined | TranslatorCredential | TranslatorTokenCredential | KeyCredential | TokenCredential,
  options?: ClientOptions
): TextTranslationClient;
export default createClient;

// @public
export interface DetectedLanguageOutput {
  language: string;
  score: number;
}

// @public
export interface DictionaryExampleItemOutput {
  examples: Array<DictionaryExampleOutput>;
  normalizedSource: string;
  normalizedTarget: string;
}

// @public
export interface DictionaryExampleOutput {
  sourcePrefix: string;
  sourceSuffix: string;
  sourceTerm: string;
  targetPrefix: string;
  targetSuffix: string;
  targetTerm: string;
}

// @public
export interface DictionaryExampleTextItem extends InputTextItem {
  translation: string;
}

// @public
export interface DictionaryLookupItemOutput {
  displaySource: string;
  normalizedSource: string;
  translations: Array<DictionaryTranslationOutput>;
}

// @public
export interface DictionaryTranslationOutput {
  backTranslations: Array<BackTranslationOutput>;
  confidence: number;
  displayTarget: string;
  normalizedTarget: string;
  posTag: string;
  prefixWord: string;
}

// @public
export interface ErrorDetailsOutput {
  code: number;
  message: string;
}

// @public
export interface ErrorResponseOutput {
  error: ErrorDetailsOutput;
}

// @public (undocumented)
export interface FindSentenceBoundaries {
  post(
    options: FindSentenceBoundariesParameters
  ): StreamableMethod<FindSentenceBoundaries200Response | FindSentenceBoundariesDefaultResponse>;
}

// @public (undocumented)
export interface FindSentenceBoundaries200Headers {
  'x-requestid': string;
}

// @public
export interface FindSentenceBoundaries200Response extends HttpResponse {
  // (undocumented)
  body: Array<BreakSentenceItemOutput>;
  // (undocumented)
  headers: RawHttpHeaders & FindSentenceBoundaries200Headers;
  // (undocumented)
  status: '200';
}

// @public (undocumented)
export interface FindSentenceBoundariesBodyParam {
  body: Array<InputTextItem>;
}

// @public (undocumented)
export interface FindSentenceBoundariesDefaultHeaders {
  'x-requestid': string;
}

// @public (undocumented)
export interface FindSentenceBoundariesDefaultResponse extends HttpResponse {
  // (undocumented)
  body: ErrorResponseOutput;
  // (undocumented)
  headers: RawHttpHeaders & FindSentenceBoundariesDefaultHeaders;
  // (undocumented)
  status: string;
}

// @public (undocumented)
export interface FindSentenceBoundariesHeaderParam {
  // (undocumented)
  headers?: RawHttpHeadersInput & FindSentenceBoundariesHeaders;
}

// @public (undocumented)
export interface FindSentenceBoundariesHeaders {
  'X-ClientTraceId'?: string;
}

// @public (undocumented)
export type FindSentenceBoundariesParameters = FindSentenceBoundariesQueryParam &
  FindSentenceBoundariesHeaderParam &
  FindSentenceBoundariesBodyParam &
  RequestParameters;

// @public (undocumented)
export interface FindSentenceBoundariesQueryParam {
  // (undocumented)
  queryParameters?: FindSentenceBoundariesQueryParamProperties;
}

// @public (undocumented)
export interface FindSentenceBoundariesQueryParamProperties {
  language?: string;
  script?: string;
}

// @public (undocumented)
export interface GetLanguagesLatest {
  getxxx(options?: GetLanguagesParameters): StreamableMethod<GetLanguages200Response | GetLanguagesDefaultResponse>;
}

// @public (undocumented)
export interface GetLanguages200Headers {
  'x-requestid': string;
  etag: string;
}

// @public
export interface GetLanguages200Response extends HttpResponse {
  // (undocumented)
  body: GetLanguagesResultOutput;
  // (undocumented)
  headers: RawHttpHeaders & GetLanguages200Headers;
  // (undocumented)
  status: '200';
}

// @public (undocumented)
export interface GetLanguagesDefaultHeaders {
  'x-requestid': string;
}

// @public (undocumented)
export interface GetLanguagesDefaultResponse extends HttpResponse {
  // (undocumented)
  body: ErrorResponseOutput;
  // (undocumented)
  headers: RawHttpHeaders & GetLanguagesDefaultHeaders;
  // (undocumented)
  status: string;
}

// @public (undocumented)
export interface GetLanguagesHeaderParam {
  // (undocumented)
  headers?: RawHttpHeadersInput & GetLanguagesHeaders;
}

// @public (undocumented)
export interface GetLanguagesHeaders {
  'Accept-Language'?: string;
  'If-None-Match'?: string;
  'X-ClientTraceId'?: string;
}

// @public (undocumented)
export type GetLanguagesParameters = GetLanguagesQueryParam & GetLanguagesHeaderParam & RequestParameters;

// @public (undocumented)
export interface GetLanguagesQueryParam {
  // (undocumented)
  queryParameters?: GetLanguagesQueryParamProperties;
}

// @public (undocumented)
export interface GetLanguagesQueryParamProperties {
  scope?: string;
}

// @public
export interface GetLanguagesResultOutput {
  dictionary?: Record<string, SourceDictionaryLanguageOutput>;
  translation?: Record<string, TranslationLanguageOutput>;
  transliteration?: Record<string, TransliterationLanguageOutput>;
}

// @public
export interface InputTextItem {
  text: string;
}

// @public (undocumented)
export function isUnexpected(
  response: GetLanguages200Response | GetLanguagesDefaultResponse
): response is GetLanguagesDefaultResponse;

// @public (undocumented)
export function isUnexpected(
  response: Translate200Response | TranslateDefaultResponse
): response is TranslateDefaultResponse;

// @public (undocumented)
export function isUnexpected(
  response: Transliterate200Response | TransliterateDefaultResponse
): response is TransliterateDefaultResponse;

// @public (undocumented)
export function isUnexpected(
  response: FindSentenceBoundaries200Response | FindSentenceBoundariesDefaultResponse
): response is FindSentenceBoundariesDefaultResponse;

// @public (undocumented)
export function isUnexpected(
  response: LookupDictionaryEntries200Response | LookupDictionaryEntriesDefaultResponse
): response is LookupDictionaryEntriesDefaultResponse;

// @public (undocumented)
export function isUnexpected(
  response: LookupDictionaryExamples200Response | LookupDictionaryExamplesDefaultResponse
): response is LookupDictionaryExamplesDefaultResponse;

// @public (undocumented)
export interface LookupDictionaryEntries {
  post(
    options: LookupDictionaryEntriesParameters
  ): StreamableMethod<LookupDictionaryEntries200Response | LookupDictionaryEntriesDefaultResponse>;
}

// @public (undocumented)
export interface LookupDictionaryEntries200Headers {
  'x-requestid': string;
}

// @public
export interface LookupDictionaryEntries200Response extends HttpResponse {
  // (undocumented)
  body: Array<DictionaryLookupItemOutput>;
  // (undocumented)
  headers: RawHttpHeaders & LookupDictionaryEntries200Headers;
  // (undocumented)
  status: '200';
}

// @public (undocumented)
export interface LookupDictionaryEntriesBodyParam {
  body: Array<InputTextItem>;
}

// @public (undocumented)
export interface LookupDictionaryEntriesDefaultHeaders {
  'x-requestid': string;
}

// @public (undocumented)
export interface LookupDictionaryEntriesDefaultResponse extends HttpResponse {
  // (undocumented)
  body: ErrorResponseOutput;
  // (undocumented)
  headers: RawHttpHeaders & LookupDictionaryEntriesDefaultHeaders;
  // (undocumented)
  status: string;
}

// @public (undocumented)
export interface LookupDictionaryEntriesHeaderParam {
  // (undocumented)
  headers?: RawHttpHeadersInput & LookupDictionaryEntriesHeaders;
}

// @public (undocumented)
export interface LookupDictionaryEntriesHeaders {
  'X-ClientTraceId'?: string;
}

// @public (undocumented)
export type LookupDictionaryEntriesParameters = LookupDictionaryEntriesQueryParam &
  LookupDictionaryEntriesHeaderParam &
  LookupDictionaryEntriesBodyParam &
  RequestParameters;

// @public (undocumented)
export interface LookupDictionaryEntriesQueryParam {
  // (undocumented)
  queryParameters: LookupDictionaryEntriesQueryParamProperties;
}

// @public (undocumented)
export interface LookupDictionaryEntriesQueryParamProperties {
  from: string;
  to: string;
}

// @public (undocumented)
export interface LookupDictionaryExamples {
  post(
    options: LookupDictionaryExamplesParameters
  ): StreamableMethod<LookupDictionaryExamples200Response | LookupDictionaryExamplesDefaultResponse>;
}

// @public (undocumented)
export interface LookupDictionaryExamples200Headers {
  'x-requestid': string;
}

// @public
export interface LookupDictionaryExamples200Response extends HttpResponse {
  // (undocumented)
  body: Array<DictionaryExampleItemOutput>;
  // (undocumented)
  headers: RawHttpHeaders & LookupDictionaryExamples200Headers;
  // (undocumented)
  status: '200';
}

// @public (undocumented)
export interface LookupDictionaryExamplesBodyParam {
  body: Array<DictionaryExampleTextItem>;
}

// @public (undocumented)
export interface LookupDictionaryExamplesDefaultHeaders {
  'x-requestid': string;
}

// @public (undocumented)
export interface LookupDictionaryExamplesDefaultResponse extends HttpResponse {
  // (undocumented)
  body: ErrorResponseOutput;
  // (undocumented)
  headers: RawHttpHeaders & LookupDictionaryExamplesDefaultHeaders;
  // (undocumented)
  status: string;
}

// @public (undocumented)
export interface LookupDictionaryExamplesHeaderParam {
  // (undocumented)
  headers?: RawHttpHeadersInput & LookupDictionaryExamplesHeaders;
}

// @public (undocumented)
export interface LookupDictionaryExamplesHeaders {
  'X-ClientTraceId'?: string;
}

// @public (undocumented)
export type LookupDictionaryExamplesParameters = LookupDictionaryExamplesQueryParam &
  LookupDictionaryExamplesHeaderParam &
  LookupDictionaryExamplesBodyParam &
  RequestParameters;

// @public (undocumented)
export interface LookupDictionaryExamplesQueryParam {
  // (undocumented)
  queryParameters: LookupDictionaryExamplesQueryParamProperties;
}

// @public (undocumented)
export interface LookupDictionaryExamplesQueryParamProperties {
  from: string;
  to: string;
}

// @public (undocumented)
export interface Routes {
  (path: '/languages'): GetLanguagesLatest;
  (path: '/translate'): Translate;
  (path: '/transliterate'): Transliterate;
  (path: '/breaksentence'): FindSentenceBoundaries;
  (path: '/dictionary/lookup'): LookupDictionaryEntries;
  (path: '/dictionary/examples'): LookupDictionaryExamples;
}

// @public
export interface SentenceLengthOutput {
  srcSentLen: number[];
  transSentLen: number[];
}

// @public
export interface SourceDictionaryLanguageOutput {
  dir: string;
  name: string;
  nativeName: string;
  translations: Array<TargetDictionaryLanguageOutput>;
}

// @public
export interface SourceTextOutput {
  text: string;
}

// @public
export interface TargetDictionaryLanguageOutput {
  code: string;
  dir: string;
  name: string;
  nativeName: string;
}

// @public (undocumented)
export type TextTranslationClient = Client & {
  path: Routes;
};

// @public (undocumented)
export interface Translate {
  post(options: TranslateParameters): StreamableMethod<Translate200Response | TranslateDefaultResponse>;
}

// @public (undocumented)
export interface Translate200Headers {
  'x-metered-usage': number;
  'x-mt-system': string;
  'x-requestid': string;
}

// @public
export interface Translate200Response extends HttpResponse {
  // (undocumented)
  body: Array<TranslatedTextItemOutput>;
  // (undocumented)
  headers: RawHttpHeaders & Translate200Headers;
  // (undocumented)
  status: '200';
}

// @public (undocumented)
export interface TranslateBodyParam {
  body: Array<InputTextItem>;
}

// @public (undocumented)
export interface TranslateDefaultHeaders {
  'x-requestid': string;
}

// @public (undocumented)
export interface TranslateDefaultResponse extends HttpResponse {
  // (undocumented)
  body: ErrorResponseOutput;
  // (undocumented)
  headers: RawHttpHeaders & TranslateDefaultHeaders;
  // (undocumented)
  status: string;
}

// @public
export interface TranslatedTextAlignmentOutput {
  proj: string;
}

// @public
export interface TranslatedTextItemOutput {
  detectedLanguage?: DetectedLanguageOutput;
  sourceText?: SourceTextOutput;
  translations: Array<TranslationOutput>;
}

// @public (undocumented)
export interface TranslateHeaderParam {
  // (undocumented)
  headers?: RawHttpHeadersInput & TranslateHeaders;
}

// @public (undocumented)
export interface TranslateHeaders {
  'X-ClientTraceId'?: string;
}

// @public (undocumented)
export type TranslateParameters = TranslateQueryParam & TranslateHeaderParam & TranslateBodyParam & RequestParameters;

// @public (undocumented)
export interface TranslateQueryParam {
  // (undocumented)
  queryParameters: TranslateQueryParamProperties;
}

// @public (undocumented)
export interface TranslateQueryParamProperties {
  allowFallback?: boolean;
  category?: string;
  from?: string;
  fromScript?: string;
  includeAlignment?: boolean;
  includeSentenceLength?: boolean;
  profanityAction?: string;
  profanityMarker?: string;
  suggestedFrom?: string;
  textType?: string;
  to: string;
  toScript?: string;
}

// @public
export interface TranslationLanguageOutput {
  dir: string;
  name: string;
  nativeName: string;
}

// @public
export interface TranslationOutput {
  alignment?: TranslatedTextAlignmentOutput;
  sentLen?: SentenceLengthOutput;
  text: string;
  to: string;
  transliteration?: TransliteratedTextOutput;
}

// @public (undocumented)
export interface TranslatorCredential {
  // (undocumented)
  key: string;
  // (undocumented)
  region: string;
}

// @public (undocumented)
export interface TranslatorTokenCredential {
  // (undocumented)
  azureResourceId: string;
  // (undocumented)
  region: string;
  // (undocumented)
  tokenCredential: TokenCredential;
}

// @public
export interface TransliterableScriptOutput extends CommonScriptModelOutput {
  toScripts: Array<CommonScriptModelOutput>;
}

// @public (undocumented)
export interface Transliterate {
  post(options: TransliterateParameters): StreamableMethod<Transliterate200Response | TransliterateDefaultResponse>;
}

// @public (undocumented)
export interface Transliterate200Headers {
  'x-requestid': string;
}

// @public
export interface Transliterate200Response extends HttpResponse {
  // (undocumented)
  body: Array<TransliteratedTextOutput>;
  // (undocumented)
  headers: RawHttpHeaders & Transliterate200Headers;
  // (undocumented)
  status: '200';
}

// @public (undocumented)
export interface TransliterateBodyParam {
  body: Array<InputTextItem>;
}

// @public (undocumented)
export interface TransliterateDefaultHeaders {
  'x-requestid': string;
}

// @public (undocumented)
export interface TransliterateDefaultResponse extends HttpResponse {
  // (undocumented)
  body: ErrorResponseOutput;
  // (undocumented)
  headers: RawHttpHeaders & TransliterateDefaultHeaders;
  // (undocumented)
  status: string;
}

// @public
export interface TransliteratedTextOutput {
  script: string;
  text: string;
}

// @public (undocumented)
export interface TransliterateHeaderParam {
  // (undocumented)
  headers?: RawHttpHeadersInput & TransliterateHeaders;
}

// @public (undocumented)
export interface TransliterateHeaders {
  'X-ClientTraceId'?: string;
}

// @public (undocumented)
export type TransliterateParameters = TransliterateQueryParam &
  TransliterateHeaderParam &
  TransliterateBodyParam &
  RequestParameters;

// @public (undocumented)
export interface TransliterateQueryParam {
  // (undocumented)
  queryParameters: TransliterateQueryParamProperties;
}

// @public (undocumented)
export interface TransliterateQueryParamProperties {
  fromScript: string;
  language: string;
  toScript: string;
}

// @public
export interface TransliterationLanguageOutput {
  name: string;
  nativeName: string;
  scripts: Array<TransliterableScriptOutput>;
}

// (No @packageDocumentation comment for this package)
