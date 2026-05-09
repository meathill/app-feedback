import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-3-flash-preview';

const PROMPT_PREFIX = `Translate the following user feedback into English. Preserve meaning, tone, and line breaks. If it's already English, return it unchanged. Output only the translation, no preface, no quotes.

---
`;

export async function translateToEnglish(text: string, apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: PROMPT_PREFIX + text,
  });

  const result = response.text?.trim();
  if (!result) {
    throw new Error('Gemini returned empty translation');
  }
  return result;
}
