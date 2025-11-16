import { credential } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { setGlobalOptions } from 'firebase-functions';
import { onRequest } from 'firebase-functions/https';
import { callFunction } from './call';
import { toolsFunction } from './tools';

initializeApp({
  credential: credential.applicationDefault(), // or cert(...)
});

setGlobalOptions({ maxInstances: 10 });

initializeApp();

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
export const helloWorld = onRequest(callFunction);
export const tools = onRequest(toolsFunction);
