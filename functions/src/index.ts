// functions/src/index.ts
import { VapiClient } from '@vapi-ai/server-sdk';
import { setGlobalOptions } from 'firebase-functions';
import { onRequest } from 'firebase-functions/https';
import { z } from 'zod';
import { defineString } from 'firebase-functions/params';

setGlobalOptions({ maxInstances: 10 });

// Define some parameters
const VAPI_API_KEY = defineString('VAPI_API_KEY');

const vapi = new VapiClient({
  token: VAPI_API_KEY.value(),
});

const callSchema = z.object({
  phone_number: z.string(),
  language: z.enum(['en', 'fi', 'sv', 'de']),
  mode: z.enum(['inbound', 'outbound']),
});

const languageName = {
  en: 'english',
  fi: 'finish',
  sv: 'swedish',
  de: 'german',
} as const;

export const helloWorld = onRequest(async (req, res) => {
  try {
    console.log(req.body);
    const data = callSchema.parse(req.body);
    await vapi.calls.create({
      assistantId:
        data.mode === 'inbound'
          ? 'cadd9b50-f036-4b7b-8915-eb11b0ba7f09'
          : '5b2b2220-7f9a-4e57-a03e-cc7d1826a392',
      customer: { number: data.phone_number },
      phoneNumberId: '915f242b-9027-4389-9a9b-9866b5e9ca2b',
      assistantOverrides: {
        transcriber: {
          provider: '11labs',
          language: data.language,
        },
        variableValues: {
          language: languageName[data.language],
        },
      },
    });

    res.json({ success: true });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});
