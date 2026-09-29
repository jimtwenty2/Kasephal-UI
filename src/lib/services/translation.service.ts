import { env } from "@/lib/env";

// The API endpoint for translation service
const TRANSLATION_API_URL = `${env.NEXT_PUBLIC_BASE_API_URL}/translate/i18n`;

/**
 * Request structure for the translation API
 * @param messages - Key-value pairs of text to translate (key is the translation key, value is the text)
 * @param src_lang - Source language code (e.g., "eng" for English)
 * @param tgt_lang - Target language code (e.g., "kh" for Khmer)
 */
export interface TranslationRequest {
  messages: Record<string, string>;
  src_lang: string;
  tgt_lang: string;
}

/**
 * Response structure from the translation API
 * @param payload - Contains the translated messages if successful
 */
export interface TranslationResponse {
  payload?: {
    messages: Record<string, string>;
  };
}

/**
 * Translates a batch of messages from one language to another.
 * 
 * This function sends a batch of text messages to the translation API
 * and returns the translated versions.
 * 
 * @param messages - Object with translation keys and their text values to translate
 * @param srcLang - Source language code (default: "eng" for English)
 * @param tgtLang - Target language code (default: "kh" for Khmer)
 * @returns Promise that resolves to an object with the same keys but translated values
 * @throws Error if the API request fails
 * 
 * @example
 * const result = await translateBatch(
 *   { "welcome": "Welcome to our app", "login": "Login" },
 *   "eng",
 *   "kh"
 * );
 * // Returns: { "welcome": "សូមស្វាគមន៍មកកាន់កម្មវិធីរបស់យើង", "login": "ចូល" }
 */
export async function translateBatch(
  messages: Record<string, string>,
  srcLang: string = "eng",
  tgtLang: string = "kh"
): Promise<Record<string, string>> {
  // Step 1: Prepare the request body with messages and language codes
  const requestBody = {
    messages: messages,
    src_lang: srcLang,
    tgt_lang: tgtLang,
  };

  // Step 2: Send the request to the translation API
  const response = await fetch(TRANSLATION_API_URL, {
    method: "POST",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  // Step 3: Check if the request was successful
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Translation API failed: ${response.status} - ${errorText}`);
  }

  // Step 4: Parse the response and extract translated messages
  const responseData: TranslationResponse = await response.json();
  
  // Step 5: Return the translated messages, or empty object if payload is missing
  const translatedMessages = responseData.payload?.messages || {};
  return translatedMessages;
}
