# Translation System Documentation

## Overview

This translation system allows the Kasephal UI application to support multiple languages (currently English and Khmer). It automatically translates text from English to other languages using an external translation API.

## Architecture

The translation system consists of three main parts:

1. **Translation Service** (`src/lib/services/translation.service.ts`)
   - Handles direct communication with the translation API
   - Translates batches of text messages

2. **Translation Action** (`src/action/translation.action.ts`)
   - Manages large translation requests by splitting them into batches
   - Coordinates multiple API calls for efficiency

3. **I18n Context** (`src/lib/i18n/I18nContext.tsx`)
   - React context provider for managing language state
   - Provides the `t()` function for translating text in components

4. **Base Translations** (`src/lib/i18n/translations/index.ts`)
   - Aggregates all translation objects from different pages/features
   - Typed as `Record<string, string>` to allow dynamic key access
   - Serves as the source of truth for English translations

## How It Works

### Step 1: Define Base Translations

Each page or component should have a `translations.ts` file with English text:

```typescript
// src/app/(auth)/login/translations.ts
export const loginTranslations = {
  title: "Login to your account",
  email: "Email address",
  password: "Password",
  loginButton: "Login",
  forgotPassword: "Forgot password?",
};
```

### Step 2: Use the Translation Hook

In your component, use the `useI18n` hook to access translations:

```typescript
import { useI18n } from "@/lib/i18n/I18nContext";

function LoginPage() {
  const { t, language, setLanguage, isLoading } = useI18n();

  return (
    <div>
      <h1>{t("title")}</h1>
      <input placeholder={t("email")} />
      <button>{t("loginButton")}</button>
      
      {/* Language switcher */}
      <button onClick={() => setLanguage("en")}>English</button>
      <button onClick={() => setLanguage("kh")}>ខ្មែរ</button>
    </div>
  );
}
```

### Step 3: Automatic Translation

When the user changes language:
1. The I18nContext detects the language change
2. It calls `fetchTranslations()` to get translated text
3. The text is split into batches of 10 messages each
4. Each batch is sent to the translation API
5. Results are combined and stored in the context
6. All components using `t()` automatically update with new translations

## API Reference

### `translateBatch()`

**Location:** `src/lib/services/translation.service.ts`

Translates a single batch of messages.

```typescript
translateBatch(
  messages: Record<string, string>,
  srcLang: string = "eng",
  tgtLang: string = "kh"
): Promise<Record<string, string>>
```

**Parameters:**
- `messages` - Object with translation keys and text to translate
- `srcLang` - Source language code (default: "eng")
- `tgtLang` - Target language code (default: "kh")

**Returns:** Promise resolving to translated messages object

**Example:**
```typescript
const result = await translateBatch(
  { "welcome": "Welcome", "login": "Login" },
  "eng",
  "kh"
);
// Returns: { "welcome": "សូមស្វាគមន៍", "login": "ចូល" }
```

### `fetchTranslations()`

**Location:** `src/action/translation.action.ts`

Fetches translations for all messages, handling batching automatically.

```typescript
fetchTranslations(
  baseTranslations: Record<string, string>,
  targetLang: string
): Promise<Record<string, string>>
```

**Parameters:**
- `baseTranslations` - Object with translation keys and English text
- `targetLang` - Target language code (e.g., "kh", "en")

**Returns:** Promise resolving to all translated messages

**Behavior:**
- If `targetLang` is "en", returns original translations immediately
- Splits messages into batches of 10
- Translates each batch sequentially
- Combines all results into one object

### `useI18n()`

**Location:** `src/lib/i18n/I18nContext.tsx`

React hook for accessing translation functionality.

**Returns:** Object with:
- `language` - Current language ("en" or "kh")
- `setLanguage(lang)` - Function to change language
- `t(key, params?)` - Translation function
- `isLoading` - Boolean indicating if translations are loading

**Translation Function `t()`:**
```typescript
t(key: string, params?: Record<string, string>): string
```

**Parameters:**
- `key` - Translation key from your translations file
- `params` - Optional object for dynamic values

**Example with parameters:**
```typescript
// In translations.ts
export const translations = {
  greeting: "Hello, {{name}}!",
};

// In component
const message = t("greeting", { name: "John" });
// Returns: "Hello, John!" (or translated version)
```

## Language Codes

- `"en"` or `"eng"` - English
- `"kh"` - Khmer (Cambodian)

## Environment Variables

The translation API URL is configured via:

```env
NEXT_BASE_API_URL=your_api_base_url
```

The full endpoint is: `{NEXT_BASE_API_URL}/translate/i18n`

## Error Handling

- If the translation API fails, an error is thrown with status and message
- If a batch fails in `fetchTranslations()`, the entire operation stops
- The I18nContext falls back to English translations if API fails
- Check `isLoading` before showing translated content to avoid flickering

## Best Practices

1. **Keep translation keys descriptive**
   - ✅ `loginButton` or `user.greeting`
   - ❌ `btn1` or `text2`

2. **Use parameter interpolation for dynamic content**
   ```typescript
   // Instead of concatenation
   t("welcome") + " " + userName

   // Use parameters
   t("welcome", { name: userName })
   ```

3. **Handle loading states**
   ```typescript
   const { t, isLoading } = useI18n();

   if (isLoading) {
     return <div>Loading...</div>;
   }
   ```

4. **Group translations by feature/page**
   - Keep related translations together
   - Use the same key structure across similar components

5. **Test with both languages**
   - Ensure UI layout works with longer Khmer text
   - Check that all keys have translations

6. **Type safety for translation objects**
   - Translation objects should be typed as `Record<string, string>` or inferred
   - Do NOT use `as const` on aggregated translation objects
   - This allows the `t()` function to accept dynamic string keys
   ```typescript
   // ✅ Correct
   export const baseTranslations: Record<string, string> = {
     ...authTranslations,
     ...commonTranslations,
   };

   // ❌ Incorrect - prevents dynamic key access
   export const baseTranslations = {
     ...authTranslations,
     ...commonTranslations,
   } as const;
   ```

7. **Exclude text that shouldn't be translated**
   - Not all text needs to go through the translation system
   - Use hardcoded strings for content that should remain the same across languages
   - **What to exclude:**
     - Proper names (e.g., "Kasephal", "John Doe")
     - Brand names and trademarks
     - Technical terms and codes (e.g., "API", "HTTP", "404")
     - URLs, email addresses, phone numbers
     - Currency symbols and numbers (e.g., "$", "100")
     - Product IDs, SKUs, or reference codes
   - **How to exclude:**
     ```typescript
     // ✅ Correct - don't add to translations, use hardcoded string
     <div>
       <h1>{t("welcome")}</h1>
       <p>Welcome to Kasephal</p>  {/* Brand name stays in English */}
       <span>API Key: {apiKey}</span>  {/* Technical term stays in English */}
     </div>

     // ❌ Incorrect - adding to translations when it shouldn't be
     export const translations = {
       brandName: "Kasephal",  // Don't translate brand names
       apiKey: "API Key",      // Don't translate technical terms
     };
     ```

## Adding a New Language

To add support for a new language:

1. Update the `Language` type in `I18nContext.tsx`:
   ```typescript
   type Language = "en" | "kh" | "new_lang";
   ```

2. Add the language code to your translation API (if needed)

3. Add a language switcher button in your UI:
   ```typescript
   <button onClick={() => setLanguage("new_lang")}>New Language</button>
   ```

## Troubleshooting

**Translations not appearing:**
- Check browser console for API errors
- Verify `NEXT_BASE_API_URL` is set correctly
- Ensure the translation API is running

**Text not translating:**
- Verify the translation key exists in base translations
- Check that the target language is not "en" (English skips translation)
- Look for errors in the browser console

**UI breaks with translated text:**
- Khmer text may be longer than English
- Ensure containers can handle variable text length
- Test with max-length translated strings

## File Structure

```
src/
├── lib/
│   ├── services/
│   │   └── translation.service.ts    # API communication
│   └── i18n/
│       ├── I18nContext.tsx           # React context provider
│       └── translations/
│           └── index.ts              # Base translations
├── action/
│   └── translation.action.ts         # Batch processing
└── app/
    ├── (auth)/
    │   └── login/
    │       └── translations.ts        # Page-specific translations
    └── (main)/
        └── home/
            └── translations.ts        # Page-specific translations
```

## Support

For issues or questions about the translation system:
1. Check this documentation first
2. Review the code comments in each file
3. Test with the provided examples
4. Contact the development team
