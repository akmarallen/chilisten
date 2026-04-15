import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import kgJSON from "./ky.json";
import ruJSON from "./ru.json";

export const resources = {
  ru: { translation: ruJSON },
  ky: { translation: kgJSON },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "ru",
  fallbackLng: "ru",
  interpolation: { escapeValue: false },
});

export const { t } = i18n;
export default i18n;
