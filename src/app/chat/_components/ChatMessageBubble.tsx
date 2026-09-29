import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatTranslationMode, Message } from "../_types/chat";
import { translateChatMessageAction } from "../_actions/translateChatMessageAction";
import MessageStatusMark from "./MessageStatusMark";

type TranslationTarget = NonNullable<ReturnType<typeof getTranslationTarget>>;
type TranslationResult = Awaited<ReturnType<typeof translateChatMessageAction>>;

const TRANSLATION_CACHE_STORAGE_KEY = "kasephal.chat.translations.v1";
const translationCache = new Map<string, string>();
const translationRequestCache = new Map<string, Promise<TranslationResult>>();
let hasHydratedTranslationCache = false;

type Props = {
  message: Message;
  showTime?: boolean;
  translationMode?: ChatTranslationMode;
  onRetry?: (message: Message) => void;
};

export default function ChatMessageBubble({
  message,
  showTime = false,
  translationMode = "original",
  onRetry,
}: Props) {
  const isMe = message.sender === "me";
  const text = message.text ?? "";
  const translationTarget = useMemo(
    () => getTranslationTarget(text, translationMode),
    [text, translationMode],
  );
  const [translationState, setTranslationState] =
    useState<TranslationState | null>(null);
  const currentTranslation =
    translationState?.messageId === message.id && translationState.text === text
      ? translationState
      : null;
  const translatedText = currentTranslation?.translatedText ?? null;
  const translationError = currentTranslation?.error ?? null;
  const isTranslating = currentTranslation?.isTranslating ?? false;
  const shouldTranslate = translationTarget !== null;
  const originalIsKhmer = hasKhmerText(text);
  const translatedIsKhmer = translatedText
    ? hasKhmerText(translatedText)
    : false;

  const translateMessage = useCallback(async () => {
    if (isTranslating || !text.trim() || !translationTarget) return;

    const cacheKey = getTranslationCacheKey(text, translationTarget);
    const cachedTranslation = getCachedTranslation(cacheKey);

    if (cachedTranslation !== null) {
      setTranslationState({
        messageId: message.id,
        text,
        translatedText: cachedTranslation,
        error: null,
        isTranslating: false,
      });
      return;
    }

    setTranslationState({
      messageId: message.id,
      text,
      translatedText: null,
      error: null,
      isTranslating: true,
    });

    const pendingRequest =
      translationRequestCache.get(cacheKey) ??
      translateChatMessageAction(
        text,
        translationTarget.sourceLanguage,
        translationTarget.targetLanguage,
      );

    translationRequestCache.set(cacheKey, pendingRequest);

    const result = await pendingRequest;
    translationRequestCache.delete(cacheKey);

    if (!result.success) {
      setTranslationState({
        messageId: message.id,
        text,
        translatedText: null,
        error: result.error,
        isTranslating: false,
      });
      return;
    }

    setCachedTranslation(cacheKey, result.translated);

    setTranslationState({
      messageId: message.id,
      text,
      translatedText: result.translated,
      error: null,
      isTranslating: false,
    });
  }, [isTranslating, message.id, text, translationTarget]);

  useEffect(() => {
    if (!shouldTranslate || translatedText || translationError) return;

    const timeoutId = window.setTimeout(() => {
      void translateMessage();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [shouldTranslate, translatedText, translationError, translateMessage]);

  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      <div className="flex items-center gap-2">
        <div
          className={`w-full max-w-full whitespace-pre-wrap wrap-break-word rounded-[18px] px-4 py-3 text-[16px] leading-snug sm:max-w-90 sm:px-5 sm:py-4 ${
            isMe
              ? "rounded-br-xl bg-primary text-white"
              : "rounded-bl-xl border border-light-grey bg-white text-primary-heading"
          }`}
        >
          <span className={originalIsKhmer ? "font-khmer" : undefined}>
            {renderTextWithLinks(text, isMe)}
          </span>

          {isTranslating && translationTarget && (
            <div
              className={`mt-3 flex items-center gap-2 border-t border-dashed pt-3 text-[14px] italic ${
                isMe
                  ? "border-white/20 text-white/75"
                  : "border-light-grey text-slate-400"
              }`}
            >
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Translating...</span>
            </div>
          )}

          {translatedText && translationTarget && (
            <div
              className={`mt-3 flex gap-2 border-t border-dashed pt-3 text-[14px] leading-snug italic ${
                isMe
                  ? "border-white/20 text-white/85"
                  : "border-light-grey text-slate-600"
              } ${translatedIsKhmer ? "font-khmer" : ""}`}
            >
              <span>{renderTextWithLinks(translatedText, isMe)}</span>
            </div>
          )}

          {translationError && translationTarget && (
            <div
              className={`mt-3 flex gap-2 border-t border-dashed pt-3 text-[14px] font-semibold leading-snug italic ${
                isMe
                  ? "border-white/20 text-red-400"
                  : "border-light-grey text-red-400"
              }`}
            >
              <span>Translation failed. Please try again!</span>
            </div>
          )}
        </div>

        {message.status === "sending" && (
          <span
            aria-label="Sending message"
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
          />
        )}
      </div>

      {isMe && (
        <div className="mt-1 flex justify-end">
          <MessageStatusMark message={message} onRetry={onRetry} />
        </div>
      )}

      {showTime && (
        <span className="mt-2 text-[12px] text-secondary-body">
          {message.time}
        </span>
      )}
    </div>
  );
}

type TranslationState = {
  messageId: string;
  text: string;
  translatedText: string | null;
  error: string | null;
  isTranslating: boolean;
};

function getTranslationCacheKey(text: string, target: TranslationTarget) {
  return [target.sourceLanguage, target.targetLanguage, text.trim()].join("::");
}

function getCachedTranslation(cacheKey: string) {
  hydrateTranslationCache();

  return translationCache.get(cacheKey) ?? null;
}

function setCachedTranslation(cacheKey: string, translatedText: string) {
  hydrateTranslationCache();

  translationCache.set(cacheKey, translatedText);
  persistTranslationCache();
}

function hydrateTranslationCache() {
  if (hasHydratedTranslationCache || typeof window === "undefined") return;

  hasHydratedTranslationCache = true;

  const storedValue = window.localStorage.getItem(
    TRANSLATION_CACHE_STORAGE_KEY,
  );
  if (!storedValue) return;

  try {
    const parsedValue = JSON.parse(storedValue) as Record<string, string>;

    Object.entries(parsedValue).forEach(([key, value]) => {
      if (typeof value === "string") {
        translationCache.set(key, value);
      }
    });
  } catch {
    window.localStorage.removeItem(TRANSLATION_CACHE_STORAGE_KEY);
  }
}

function persistTranslationCache() {
  if (typeof window === "undefined") return;

  const entries = Array.from(translationCache.entries()).slice(-200);
  window.localStorage.setItem(
    TRANSLATION_CACHE_STORAGE_KEY,
    JSON.stringify(Object.fromEntries(entries)),
  );
}

function getTranslationTarget(text: string, mode: ChatTranslationMode) {
  if (mode === "original") return null;

  return hasKhmerText(text)
    ? {
        sourceLanguage: "kh" as const,
        targetLanguage: "eng" as const,
        label: "English",
      }
    : {
        sourceLanguage: "eng" as const,
        targetLanguage: "kh" as const,
        label: "Khmer",
      };
}

function hasKhmerText(text: string) {
  return /[\u1780-\u17FF]/.test(text);
}

const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
const trailingPunctuationPattern = /[.,!?;:)]$/;

function renderTextWithLinks(text: string, isMe: boolean) {
  const parts = text.split(urlPattern);

  return parts.map((part, index) => {
    if (!part.match(urlPattern)) {
      return part;
    }

    const { urlText, trailingText } = splitTrailingPunctuation(part);
    const href = urlText.startsWith("http") ? urlText : `https://${urlText}`;

    return (
      <span key={`${part}-${index}`}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`font-semibold underline underline-offset-2 transition-colors ${
            isMe
              ? "text-white hover:text-secondary"
              : "text-primary hover:text-primary/80"
          }`}
        >
          {urlText}
        </a>
        {trailingText}
      </span>
    );
  });
}

function splitTrailingPunctuation(value: string) {
  let urlText = value;
  let trailingText = "";

  while (trailingPunctuationPattern.test(urlText)) {
    trailingText = urlText.slice(-1) + trailingText;
    urlText = urlText.slice(0, -1);
  }

  return { urlText, trailingText };
}
