/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { VapiClient } from '@vapi-ai/server-sdk';
import { setGlobalOptions } from 'firebase-functions';
import { onCall } from 'firebase-functions/https';
import { z } from 'zod';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

const vapi = new VapiClient({ token: process.env.VAPI_API_KEY! });

const callSchema = z.object({
    phone_number: z.string(),
    language: z.enum(['en', 'fi', 'sv', 'de']),
    mode: z.enum(['inbound', 'outbound']),
});

const voices = {
    en: 'en-US-JennyNeural',
    fi: 'fi-FI-HarriNeural',
    sv: 'sv-SE-SofieNeural',
    de: 'de-DE-KatjaNeural',
} as const;

const languageName = {
    en: 'english',
    fi: 'finish',
    sv: 'swedish',
    de: 'german',
} as const;

export const helloWorld = onCall((input) => {
    try {
        const data = callSchema.parse(input.data);
        vapi.calls.create({
            assistantId:
                data.mode === 'inbound'
                    ? 'cadd9b50-f036-4b7b-8915-eb11b0ba7f09'
                    : '5b2b2220-7f9a-4e57-a03e-cc7d1826a392',
            customer: { number: data.phone_number },
            assistantOverrides: {
                voice: { provider: 'azure', voiceId: voices[data.language] },
                transcriber: {
                    provider: 'deepgram',
                    model: 'nova-2', // or "nova-3"
                    language: data.language,
                },
                variableValues: {
                    language: languageName[data.language],
                },
            },
        });

        return { success: true };
    } catch (err: unknown) {
        return { error: (err as Error).message };
    }
});
