import { VapiClient } from '@vapi-ai/server-sdk';
import { getMessaging } from 'firebase-admin/messaging';
import { setGlobalOptions } from 'firebase-functions';
import { onRequest } from 'firebase-functions/https';
import { z } from 'zod';
import { defineString } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';

setGlobalOptions({ maxInstances: 10 });

initializeApp();

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

export const sendPushNotification = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    console.log(req.body);
    // const data = z
    //   .object({
    //     token: z.string(),
    //     notification: z.object({ title: z.string(), body: z.string() }),
    //     webpush: z
    //       .object({
    //         notification: z.object({
    //           actions: z.array(z.object({ action: z.string(), title: z.string() })).optional(),
    //           requireInteraction: z.boolean().optional(),
    //         }),
    //       })
    //       .optional(),
    //   })
    //   .parse(req.body);

    await getMessaging().send(req.body);

    res.json({ success: true });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
});
