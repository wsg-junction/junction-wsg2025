import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Cache from 'i18next-localstorage-cache';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/translation.json';
import de from './locales/de/translation.json';
import fi from './locales/fi/translation.json';
import sv from './locales/sv/translation.json';

i18n.use(initReactI18next)
    .use(Cache)
    .use(LanguageDetector)
    .init({
        resources: {
            'en-GB': { translation: en },
            'de-DE': { translation: de },
            fi: { translation: fi },
            sv: { translation: sv },
        },
        fallbackLng: 'en-GB',
        interpolation: { escapeValue: false },
    });
export default i18n;
