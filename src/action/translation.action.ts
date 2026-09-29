import { translateBatch } from "@/lib/services/translation.service";

// Maximum number of messages to send in a single API request
const BATCH_SIZE = 10;

/**
 * Fetches translations for all messages in the base translations object.
 * 
 * This function handles large translation requests by splitting them into
 * smaller batches to avoid overwhelming the API. It processes each batch
 * sequentially and combines all results.
 * 
 * @param baseTranslations - Object with translation keys and English text values
 * @param targetLang - Target language code (e.g., "kh" for Khmer, "en" for English)
 * @returns Promise that resolves to an object with the same keys but translated values
 * @throws Error if any batch translation fails
 * 
 * @example
 * const base = { "welcome": "Welcome", "login": "Login", "signup": "Sign up" };
 * const khmer = await fetchTranslations(base, "kh");
 * // Returns: { "welcome": "សូមស្វាគមន៍", "login": "ចូល", "signup": "ចុះឈ្មោះ" }
 */
export async function fetchTranslations(
  baseTranslations: Record<string, string>,
  targetLang: string,
  sourceLang: string = "eng"
): Promise<Record<string, string>> {
  // If source and target are both English, no translation is needed.
  if (
    (targetLang === "en" || targetLang === "eng") &&
    (sourceLang === "en" || sourceLang === "eng")
  ) {
    return baseTranslations;
  }

  // Step 1: Convert the translations object into an array of [key, value] pairs
  const translationEntries = Object.entries(baseTranslations);
  
  // Step 2: Split the entries into smaller batches
  const batches: Record<string, string>[] = [];
  
  for (let i = 0; i < translationEntries.length; i += BATCH_SIZE) {
    // Take a slice of entries for this batch
    const batchEntries = translationEntries.slice(i, i + BATCH_SIZE);
    // Convert the entries back to an object
    const batchObject = Object.fromEntries(batchEntries);
    batches.push(batchObject);
  }

  // Step 3: Translate each batch and combine the results
  const allTranslations: Record<string, string> = {};

  for (let i = 0; i < batches.length; i++) {
    const currentBatch = batches[i];
    
    try {
      // Translate this batch from English to the target language
      const translatedMessages = await translateBatch(
        currentBatch,
        sourceLang === "en" ? "eng" : sourceLang,
        targetLang === "en" ? "eng" : targetLang,
      );
      
      // Merge the translated messages into the final result
      Object.assign(allTranslations, translatedMessages);
    } catch (error) {
      // Log the error and re-throw to stop the entire process
      console.error(`Translation batch ${i + 1} of ${batches.length} failed:`, error);
      throw error;
    }
  }

  return allTranslations;
}
