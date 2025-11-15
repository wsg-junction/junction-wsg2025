import { GoogleGenAI } from "@google/genai";

const DEFAULT_API_KEY = /*process.env.VITE_GOOGLE_GENAI_KEY ??*/ "AIzaSyBR46RGV1vZmsMk5rnjriY0Fn3oxRiNlFk";

const ai = new GoogleGenAI({ apiKey: DEFAULT_API_KEY });

export async function generateGeminiRecipe(
    ingredients: string[],
    context?: string | string[],
    languageShort?: string
): Promise<string> {
    const prompt = `Create a simple recipe using the following ingredients: ${ingredients.join(
        ", "
    )}. Provide step-by-step instructions.`;
    return generateGeminiContent(prompt, "gemini-2.5-flash-lite", 300, context, languageShort);
}


export async function generateGeminiContent(
    prompt: string,
    model = "gemini-2.5-flash-lite",
    maxTokens: number = 200,
    context?: string | string[],
    languageShort?: string
): Promise<string> {
    // Build a final prompt that includes optional context and a language instruction
    let finalPrompt = '';
    if (context) {
        if (Array.isArray(context)) {
            finalPrompt += context.map((c) => `${c}`).join('\n') + '\n\n';
        } else {
            finalPrompt += context + '\n\n';
        }
    }

    finalPrompt += prompt;

    if (languageShort) {
        finalPrompt += `\n\nPlease respond in ${languageShort}.`; // languageShort like 'fi', 'sv', 'en'
    }

    const request: Record<string, unknown> = {
        model,
        contents: finalPrompt,
    };

    if (typeof maxTokens === "number") {
        // genai client uses `maxOutputTokens` for token limit
        request.maxOutputTokens = maxTokens;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: unknown = await ai.models.generateContent(request as any);

    // attempt to read candidate content with runtime checks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candidates = (result as any)?.candidates;
    const first = Array.isArray(candidates) ? candidates[0] : undefined;
    const content = first?.content;

    if (typeof content === "string") return content;
    if (content && typeof content === "object") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parts = (content as any).parts;
        if (Array.isArray(parts) && parts[0] && typeof parts[0].text === "string") {
            return parts[0].text;
        }
    }

    return "No response";
}

export { ai };
