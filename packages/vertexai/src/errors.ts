/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ErrorFactory, ErrorMap, FirebaseError } from '@firebase/util';
import { GenerateContentResponse } from './types';

export const enum VertexAIErrorCode {
  FETCH_ERROR = 'fetch-error',
  INVALID_CONTENT = 'invalid-content',
  NO_API_KEY = 'no-api-key',
  NO_MODEL = 'no-model',
  NO_PROJECT_ID = 'no-project-id',
  PARSE_FAILED = 'parse-failed',
  BAD_RESPONSE = 'bad-response',
  RESPONSE_ERROR = 'response-error'
}

const VertexAIErrorMessages: ErrorMap<VertexAIErrorCode> = {
  [VertexAIErrorCode.FETCH_ERROR]: `Error fetching from {$url}: {$message}`,
  [VertexAIErrorCode.INVALID_CONTENT]: `Content formatting error: {$message}`,
  [VertexAIErrorCode.NO_API_KEY]:
    `The "apiKey" field is empty in the local Firebase config. Firebase VertexAI requires this field to` +
    `contain a valid API key.`,
  [VertexAIErrorCode.NO_PROJECT_ID]:
    `The "projectId" field is empty in the local Firebase config. Firebase VertexAI requires this field to` +
    `contain a valid project ID.`,
  [VertexAIErrorCode.NO_MODEL]:
    `Must provide a model name. ` +
    `Example: getGenerativeModel({ model: 'my-model-name' })`,
  [VertexAIErrorCode.PARSE_FAILED]: `Parsing failed: {$message}`,
  [VertexAIErrorCode.BAD_RESPONSE]: `Bad response from {$url}: [{$status} {$statusText}] {$message}`,
  [VertexAIErrorCode.RESPONSE_ERROR]:
    `Response error: {$message}. Response body stored in ` +
    `error.customData.response`
};

/**
 * Details object that may be included in an error response.
 * @public
 */
interface ErrorDetails {
  '@type'?: string;
  reason?: string;
  domain?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface VertexAIErrorParams {
  [VertexAIErrorCode.FETCH_ERROR]: { url: string; message: string };
  [VertexAIErrorCode.INVALID_CONTENT]: { message: string };
  [VertexAIErrorCode.PARSE_FAILED]: { message: string };
  [VertexAIErrorCode.BAD_RESPONSE]: {
    url: string;
    status: number;
    statusText: string;
    message: string;
    errorDetails?: ErrorDetails[];
  };
  [VertexAIErrorCode.RESPONSE_ERROR]: {
    message: string;
    response: GenerateContentResponse;
  };
}

const ERROR_FACTORY = new ErrorFactory<VertexAIErrorCode, VertexAIErrorParams>(
  'vertexAI',
  'VertexAI',
  VertexAIErrorMessages
);

/**
 * An error returned by VertexAI.
 * @public
 */
export class VertexAIError extends FirebaseError {
  /** 
   * Error data specific that can be included in a VertexAIError 
   */
  customData: {
    /**
     * 
     */
    url?: string;
    /**
     * HTTP status code 
     */
    status?: string;
    /**
     * HTTP status text associated with an error
     */
    statusText?: string;
    /**
     * Addtional error details originating from an HTTP response.
     */
    errorDetails?: ErrorDetails[];
    /**
     * Additonal context in the form of {@link GenerateContentResponse}
     */
    response?: GenerateContentResponse;
  } = {};

  constructor(
    code: K,
    ...data: K extends keyof ErrorParams ? [ErrorParams[K]] : []
  ) {
    super(firebaseError.code, firebaseError.message, firebaseError.customData);
    this.customData = { ...firebaseError.customData } || {};
  }
}

/**
 * Create a VertexAIError.
 * 
 * @param code A {@link VertexAIErrorCode}
 * @param data Error data specific to the {@link VertexAIErrorParams}
 * @returns VertexAIError
 */
export function createVertexError<K extends VertexAIErrorCode>(
  code: K,
  ...data: K extends keyof VertexAIErrorParams ? [VertexAIErrorParams[K]] : []
): VertexAIError {
  const firebaseError = ERROR_FACTORY.create(code, ...data);
  return new VertexAIError(code, ...data);
}
