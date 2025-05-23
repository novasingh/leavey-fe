import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ms from './locales/ms.json';
import zh from './locales/zh.json';

const resources = {
  en: { translation: en },
  ms: { translation: ms },
  zh: { translation: zh },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'en', // persist language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Listen for language change and persist
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem('i18nextLng', lng);
  // console.log('Language changed to (in i18n.js):', lng); // You can uncomment this for debugging
});

export default i18n;
