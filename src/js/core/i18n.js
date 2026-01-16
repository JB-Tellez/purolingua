// Internationalization (i18n) Manager
import itUI from '../../locales/it/ui.js';
import esUI from '../../locales/es/ui.js';
import esDecks from '../../locales/es/decks.js';

// Available locales
const locales = {
    it: itUI,
    es: esUI
};

// Locale-specific decks (Italian uses window.DECKS_DATA loaded from script)
const localeDecks = {
    es: esDecks
};

// Storage key for locale preference
const LOCALE_STORAGE_KEY = 'language-learning-locale';

// Check if user has explicitly chosen a language
function hasLanguagePreference() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && locales[urlLang]) {
        return true;
    }

    const storedLang = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (storedLang && locales[storedLang]) {
        return true;
    }

    return false;
}

// Get locale from URL, localStorage, or default to Italian
function getInitialLocale() {
    // Check URL parameter first (highest priority)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && locales[urlLang]) {
        return urlLang;
    }

    // Fall back to localStorage
    const storedLang = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (storedLang && locales[storedLang]) {
        return storedLang;
    }

    // Default to Italian (but app should show picker first)
    return 'it';
}

// Current locale
let currentLocale = getInitialLocale();

/**
 * Set the current locale
 * @param {string} locale - The locale code (e.g., 'it', 'es')
 * @param {boolean} updateURL - Whether to update the URL (default true)
 */
function setLocale(locale, updateURL = true) {
    if (locales[locale]) {
        currentLocale = locale;
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
        document.documentElement.lang = getLocaleData().meta.locale.split('-')[0];

        // Update URL without page reload
        if (updateURL) {
            const url = new URL(window.location);
            url.searchParams.set('lang', locale);
            window.history.replaceState({}, '', url);
        }
    } else {
        console.warn(`Locale "${locale}" not found, keeping "${currentLocale}"`);
    }
}

/**
 * Get the current locale code
 * @returns {string}
 */
function getLocale() {
    return currentLocale;
}

/**
 * Get the full locale data object for the current locale
 * @returns {object}
 */
function getLocaleData() {
    return locales[currentLocale];
}

/**
 * Get metadata for the current locale
 * @returns {object} - { code, locale, name, flag, direction }
 */
function getLocaleMeta() {
    return getLocaleData().meta;
}

/**
 * Get decks for the current locale
 * @returns {Array} - Array of deck objects
 */
function getLocaleDecks() {
    if (currentLocale === 'it') {
        // Italian decks are loaded via script tag (window.DECKS_DATA)
        return window.DECKS_DATA || [];
    }
    return localeDecks[currentLocale] || [];
}

/**
 * Get a translated string by key path
 * Supports dot notation: t('feedback.correct')
 * Supports interpolation: t('streak.daysInARow', { count: 5 })
 *
 * @param {string} key - Dot-notation key path
 * @param {object} params - Optional interpolation parameters
 * @returns {string}
 */
function t(key, params = {}) {
    const keys = key.split('.');
    let value = getLocaleData();

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            console.warn(`Translation key "${key}" not found for locale "${currentLocale}"`);
            return key;
        }
    }

    if (typeof value !== 'string') {
        console.warn(`Translation key "${key}" is not a string`);
        return key;
    }

    // Handle interpolation: {count}, {text}, etc.
    return value.replace(/\{(\w+)\}/g, (match, paramName) => {
        return params[paramName] !== undefined ? params[paramName] : match;
    });
}

/**
 * Get available locales with their metadata
 * @returns {Array} - Array of { code, name, flag }
 */
function getAvailableLocales() {
    return Object.entries(locales).map(([code, data]) => ({
        code,
        name: data.meta.name,
        flag: data.meta.flag
    }));
}

/**
 * Register a new locale
 * @param {string} code - The locale code
 * @param {object} data - The locale data object
 * @param {Array} decks - Optional decks for this locale
 */
function registerLocale(code, data, decks = null) {
    locales[code] = data;
    if (decks) {
        localeDecks[code] = decks;
    }
}

export {
    setLocale,
    getLocale,
    getLocaleData,
    getLocaleMeta,
    getLocaleDecks,
    t,
    getAvailableLocales,
    registerLocale,
    hasLanguagePreference
};
