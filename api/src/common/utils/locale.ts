export const SUPPORTED_LOCALES = ['tr', 'en', 'de'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'tr';

export function resolveLocale(locale?: string, acceptLanguage?: string): SupportedLocale {
  const candidates = [
    locale,
    ...(acceptLanguage?.split(',').map((part) => part.split(';')[0]) ?? []),
  ];

  for (const candidate of candidates) {
    const normalized = candidate?.trim().toLowerCase().split('-')[0];
    if (SUPPORTED_LOCALES.includes(normalized as SupportedLocale)) {
      return normalized as SupportedLocale;
    }
  }

  return DEFAULT_LOCALE;
}

export type LocalizedFields = Record<string, string | null | undefined>;

export type TranslationMap = Partial<Record<SupportedLocale, LocalizedFields>>;

export function getLocalizedFields(
  translations: unknown,
  locale: SupportedLocale,
): LocalizedFields {
  if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
    return {};
  }

  return (translations as TranslationMap)[locale] ?? {};
}
