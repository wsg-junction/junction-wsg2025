import { GoogleGenAI } from '@google/genai';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/https';
import { defineString } from 'firebase-functions/params';
import { productService } from './replacements';

// Define some parameters

async function handleUpdateOrder(args: {
  order_id: string;
  unavailable_product: string;
  replacement_product: string;
  quantity: number;
}) {
  // Example only — replace with your real logic
  try {
    const { order_id, unavailable_product, replacement_product, quantity } = args;

    const db = getFirestore();
    const orderRef = db.collection('orders').doc(order_id);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      throw Error(`Order ${order_id} not found`);
    }
    const order = orderSnap.data();
    // @ts-expect-error: Missing in types
    const newProducts = order.products.filter((p) => p.id !== unavailable_product);
    const newProd = productService.getProductById(replacement_product);
    if (!newProd) {
      throw Error(`Product ${replacement_product} not found`);
    }
    newProducts.push({
      ...newProd,
      orderedQuantity: quantity,
      pickEvent: null,
    });
    await orderRef.update({
      products: newProducts,
    });
    return `Order ${order_id} updated. Replaced ${unavailable_product} with ${replacement_product}.`;
  } catch {
    return 'Error updating order.';
  }
}

const GOOGLE_MAPS_KEY = defineString('GOOGLE_MAPS_KEY');

async function handleFindNearbySupermarkets(args: { languageCode: string; orderId: string }) {
  const { languageCode, orderId } = args;

  const db = getFirestore();

  try {
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      throw new Error(`Order ${orderId} not found`);
    }

    const orderData = orderSnap.data();
    if (!orderData?.deliveryLocation?.lat || !orderData?.deliveryLocation?.lng) {
      throw new Error('Order does not contain a valid delivery location.');
    }

    const { lat, lng } = orderData.deliveryLocation;

    // 2. Call Google Places Nearby Search API
    const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_KEY.value(),
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location',
      },
      body: JSON.stringify({
        includedPrimaryTypes: ['grocery_store'],
        maxResultCount: 3,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 2000,
          },
        },
        rankPreference: 1,
        languageCode,
      }),
    }).then((r) => r.json());

    // 3. Extract top 3 supermarkets
    const top3 =
      // @ts-expect-error: Missing in types
      res.places?.map((place) => ({
        name: place.displayName.text,
        address: place.formattedAddress,
      })) ?? [];

    // 4. Return formatted string (like your mock function)
    // @ts-expect-error: Missing in types
    return top3.map((p) => `${p.name} - ${p.address}`).join('; ');
  } catch (error) {
    console.error('Error fetching nearby supermarkets:', error);
    return 'Could not fetch nearby supermarkets.';
  }
}

const GOOGLE_GEMINI_KEY = defineString('GOOGLE_GEMINI_KEY');
const ai = new GoogleGenAI({ vertexai: false, apiKey: GOOGLE_GEMINI_KEY.value() });

async function handleGetRecipeAlternatives(args: {
  original_dish: string;
  missing_ingredient: string;
  language: string;
}) {
  const { language, original_dish, missing_ingredient } = args;
  const mi = JSON.parse(missing_ingredient);

  const prompt = `
Given:
- Original dish: ${original_dish}
- Missing ingredients: ${mi.map((i: { name: string }) => `${i.name}`).join(', ')}

Suggest 2-3 alternative dishes that use the ingredients of the original dish and do not require the missing ingredients. Make sure, that these suggestions are not to similar. Answer in ${language}.
Each item must contain:
- name (string, must be simple and precise)
- description (string, brief and focused on the ingredients)
`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            recipe: { type: 'string' },
            description: { type: 'string' },
          },
          required: ['recipe', 'description'],
        },
        minItems: 2,
      },
    },
  });

  const recipes = JSON.parse(response.text!);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return recipes.map((r: any) => `${r.recipe} - ${r.description}`).join('; ');
}

// --- Main Endpoint ----------------------------------------------------------
export const toolsFunction: Parameters<typeof onRequest>[0] = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const body = req.body.message;
    console.log(body.assistant.variableValues);

    if (!body.toolCallList) {
      res.status(400).send({ error: 'Invalid request: missing toolCallList' });
      return;
    }

    const results = [];

    for (const toolCall of body.toolCallList) {
      const { name, arguments: toolArgs } = toolCall.function;
      const orderId = body.assistant.variableValues?.order_id ?? 'unknown_order';
      const missing_ingredients = body.assistant.variableValues?.missing_ingredients ?? 'none';
      const languageCode = body.assistant.variableValues?.language ?? 'english';
      const language = body.assistant.variableValues?.language_code ?? 'en';

      let result: unknown;

      switch (name) {
        case 'update_order':
          result = await handleUpdateOrder({ ...toolArgs, orderId });
          break;

        case 'find_nearby_supermarkets':
          result = await handleFindNearbySupermarkets({ orderId, languageCode });
          break;

        case 'get_recipe_alternatives':
          result = await handleGetRecipeAlternatives({
            ...toolArgs,
            missing_ingredient: missing_ingredients as string,
            language,
          });
          break;

        default:
          result = { error: `Unknown tool: ${name}` };
          break;
      }

      results.push({
        toolCallId: toolCall.id,
        result,
      });
    }

    res.status(200).send({ results });
  } catch (error) {
    console.error('Tool Handler Error:', error);
    res.status(500).send({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : error,
    });
  }
};
