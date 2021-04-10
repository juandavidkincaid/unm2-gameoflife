import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        debug: process.env.NODE_ENV === 'development',
        resources,
        lng: 'es',
        fallbackLng: 'es',
        supportedLngs: ['es', 'es-CO', 'en', 'en-US'],

        keySeparator: false, // we do not use keys in form messages.welcome

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export { i18n };