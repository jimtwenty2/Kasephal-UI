"use server";

import {
  translateChatMessagesService,
  type ChatTranslationLanguage,
} from "@/services/chat-translation.service";

type TranslateChatMessageActionResult =
  | {
      success: true;
      translated: string;
      sourceLanguage: ChatTranslationLanguage;
      targetLanguage: ChatTranslationLanguage;
    }
  | {
      success: false;
      error: string;
    };

export async function translateChatMessageAction(
  text: string,
  sourceLanguage: ChatTranslationLanguage,
  targetLanguage: ChatTranslationLanguage,
): Promise<TranslateChatMessageActionResult> {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return { success: false, error: "Message is empty." };
  }

  try {
    const [result] = await translateChatMessagesService(
      [normalizedText],
      sourceLanguage,
      targetLanguage,
    );

    if (!result?.translated) {
      return { success: false, error: "Translation returned no result." };
    }

    return {
      success: true,
      translated: result.translated,
      sourceLanguage: result.sourceLang,
      targetLanguage: result.targetLang,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to translate chat message.",
    };
  }
}
