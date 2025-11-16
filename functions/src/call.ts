import { VapiClient } from '@vapi-ai/server-sdk';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/https';
import { defineString } from 'firebase-functions/params';
import { z } from 'zod';
import { productCategoryService } from './replacements';

// Define some parameters
const VAPI_API_KEY = defineString('VAPI_API_KEY');

const vapi = new VapiClient({
  token: VAPI_API_KEY.value(),
});

const callSchema = z.object({
  phone_number: z.string(),
  language: z.enum(['en', 'fi', 'sv', 'de']),
  order_id: z.string(),
});

const voices = {
  en: 'scOwDtmlUjD3prqpp97I',
  fi: 'F9w7aaEjfT09qV89OdY8',
  sv: '1k39YpzqXZn52BgyLyGO',
  de: 'fzqS9sNPYJhLlhsfDm0l',
} as const;

const languageName = {
  en: 'english',
  fi: 'finnish',
  sv: 'swedish',
  de: 'german',
} as const;

export const callFunction: Parameters<typeof onRequest>[0] = async (req, res) => {
  try {
    const data = callSchema.parse(req.body);

    const db = getFirestore();
    const ref = db.collection('orders').doc(data.order_id);
    const snap = await ref.get();

    if (!snap.exists) {
      throw Error(`Order ${data.order_id} not found`);
    }

    const order = {
      id: snap.id,
      ...snap.data(),
    } as {
      id: string;
      products: Array<{
        id: string;
        names: Array<{
          value: string;
          language: string;
        }>;
        orderedQuantity: number;
        pickEvent?: { quantity: number };
      }>;
    };

    const missing_items = order.products
      .map(({ id, names, orderedQuantity, pickEvent }) => {
        const picked = pickEvent?.quantity ?? 0;
        const missing = orderedQuantity - picked;

        return missing > 0
          ? {
              id,
              name: names?.find((t) => t.language === 'en')?.value || names?.[0]?.value || '',
              orderedQuantity,
              pickedQuantity: picked,
              missingQuantity: missing,
            }
          : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .map((item) => ({
        id: item.id,
        name: item.name,
        replacements: productCategoryService.findSimilarProductsById(item.id, 2).map((p) => ({
          id: p.id,
          name: p.names?.find((t) => t.language === 'en')?.value || p.names?.[0]?.value || '',
        })),
      }));

    await vapi.calls.create({
      assistantId: '5b2b2220-7f9a-4e57-a03e-cc7d1826a392',
      customer: { number: data.phone_number },
      phoneNumberId: '915f242b-9027-4389-9a9b-9866b5e9ca2b',
      assistantOverrides: {
        voice: {
          provider: '11labs',
          model: 'eleven_flash_v2_5',
          voiceId: voices[data.language],
        },
        transcriber: {
          provider: '11labs',
          language: data.language,
        },
        variableValues: {
          language: languageName[data.language],
          languageCode: data.language,
          order_id: data.order_id,
          missing_ingredients: JSON.stringify(missing_items),
        },
        metadata: {
          language: languageName[data.language],
          languageCode: data.language,
          order_id: data.order_id,
          missing_ingredients: JSON.stringify(missing_items),
        },
      },
    });

    res.json({ success: true });
  } catch (err: unknown) {
    res.status(400).json({ error: (err as Error).message });
  }
};
