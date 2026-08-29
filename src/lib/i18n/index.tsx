import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import { resources } from './resources';

export type { TxKeyPath } from './types';

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false,
  },
});

// Dat Expense currently uses English/LTR.
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

export const isRTL = false;

export const translate = (
  key: string,
  options?: Record<string, unknown>
): string => {
  return i18n.t(key, options) as string;
};

export const syncLanguage = (language: string): void => {
  void i18n.changeLanguage(language);

  const shouldBeRTL = language === 'ar';

  I18nManager.allowRTL(shouldBeRTL);
  I18nManager.forceRTL(shouldBeRTL);
};

export default i18n;