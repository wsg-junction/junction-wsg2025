import * as React from 'react';
import type { TranslatedName } from '@/services/ProductService.ts';
import { useTranslation } from 'react-i18next';

type I18nLike = { language?: string };

export function useProductName(langOrI18n?: string | I18nLike) {
  const { i18n } = useTranslation();

  const nameLanguageMap = React.useMemo(
    () =>
      ({
        'de-DE': 'en',
        'en-GB': 'en',
        'fi-FI': 'fi',
        'sv-FI': 'sv',
        fi: 'fi',
        sv: 'sv',
      }) as Record<string, string>,
    [],
  );

  // Resolve language from parameter or from the i18n instance
  const resolvedLanguage = React.useMemo(() => {
    if (typeof langOrI18n === 'string') return langOrI18n;
    if (langOrI18n && typeof (langOrI18n as I18nLike).language === 'string')
      return (langOrI18n as I18nLike).language;
    return i18n?.language || 'en';
  }, [langOrI18n, i18n?.language]);

  const getter = React.useMemo(
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    () => (product?: { names?: TranslatedName[] } | null) => {
      if (!product || !product.names || product.names.length === 0) return 'Unknown Product';

      // Try a few candidate language keys in order of preference
      const candidates = [] as string[];
      if (resolvedLanguage) candidates.push(resolvedLanguage);
      if (nameLanguageMap[resolvedLanguage]) candidates.push(nameLanguageMap[resolvedLanguage]);
      if (typeof resolvedLanguage === 'string' && resolvedLanguage.includes('-'))
        candidates.push(resolvedLanguage.split('-')[0]);

      // also include plain short language fallback
      if (i18n?.language && !candidates.includes(i18n.language)) candidates.push(i18n.language);

      for (const lang of candidates) {
        const nameObj = product.names.find((n) => n.language === lang);
        if (nameObj && nameObj.value) return nameObj.value;
      }

      // Fallback to the first available name
      return product.names.length > 0 ? product.names[0].value : 'Unknown Product';
    },
    [resolvedLanguage, i18n?.language, nameLanguageMap],
  );

  return getter;
}
