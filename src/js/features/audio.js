// Audio Logic - Speech Synthesis
import { getLocaleMeta, getLocaleData } from '../core/i18n.js';

let cachedVoice = null;
let cachedLocale = null;

function findBestVoice() {
    const meta = getLocaleMeta();
    const localeData = getLocaleData();
    const langCode = meta.code; // e.g., 'it', 'es'
    const fullLocale = meta.locale; // e.g., 'it-IT', 'es-ES'

    const voices = window.speechSynthesis.getVoices();
    const matchingVoices = voices.filter(voice => voice.lang.startsWith(langCode));

    if (matchingVoices.length === 0) return null;

    // Use preferred voice names from locale if available
    const preferredNames = localeData.voices?.preferred || [];
    for (const name of preferredNames) {
        const voice = matchingVoices.find(v => v.name.includes(name));
        if (voice) return voice;
    }

    // Otherwise, prefer voices explicitly marked with full locale (e.g., it-IT)
    const exactLocaleVoice = matchingVoices.find(v => v.lang === fullLocale);
    if (exactLocaleVoice) return exactLocaleVoice;

    // Fall back to first matching voice
    return matchingVoices[0];
}

function getVoice() {
    const currentLocale = getLocaleMeta().locale;

    // Re-fetch voice if locale changed
    if (cachedLocale !== currentLocale) {
        cachedVoice = findBestVoice();
        cachedLocale = currentLocale;
    }

    return cachedVoice;
}

function speak(text) {
    if (!window.speechSynthesis) {
        console.warn('Speech synthesis not supported');
        return;
    }

    window.speechSynthesis.cancel();

    const meta = getLocaleMeta();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = meta.locale;
    utterance.rate = 0.9;

    const voice = getVoice();
    if (voice) {
        utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
}

function initializeVoices() {
    if (window.speechSynthesis) {
        // Voices may load asynchronously
        window.speechSynthesis.onvoiceschanged = () => {
            cachedVoice = findBestVoice();
            cachedLocale = getLocaleMeta().locale;
        };
        // Try loading immediately too
        cachedVoice = findBestVoice();
        cachedLocale = getLocaleMeta().locale;
    }
}

export { speak, initializeVoices };
