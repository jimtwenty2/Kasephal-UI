import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";

export type ChatTranslationLanguage = "eng" | "kh";

type TranslateChatRequest = {
  input_text: string[];
  src_lang: ChatTranslationLanguage;
  tgt_lang: ChatTranslationLanguage;
};

type TranslateChatResult = {
  original: string;
  sourceLang: ChatTranslationLanguage;
  targetLang: ChatTranslationLanguage;
  translated: string;
};

type TranslateChatResponse = {
  success?: boolean;
  message?: string;
  payload?: {
    results?: TranslateChatResult[];
  };
};

export async function translateChatMessagesService(
  inputText: string[],
  sourceLanguage: ChatTranslationLanguage,
  targetLanguage: ChatTranslationLanguage,
) {
  const headers = await headerToken();
  const body: TranslateChatRequest = {
    input_text: inputText,
    src_lang: sourceLanguage,
    tgt_lang: targetLanguage,
  };

  const response = await fetch(`${env.NEXT_BASE_API_URL}/translate/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as
    | TranslateChatResponse
    | null;

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message ?? "Failed to translate chat message.");
  }

  return data?.payload?.results ?? [];
}
