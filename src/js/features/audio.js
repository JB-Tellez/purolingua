// Audio Logic - Speech Synthesis for Italian text
let bestItalianVoice = null;

function findBestItalianVoice() {
    const voices = window.speechSynthesis.getVoices();
    const italianVoices = voices.filter(voice => voice.lang.startsWith('it'));

    if (italianVoices.length === 0) return null;

    // Prefer specific high-quality voices on iOS
    const preferredNames = ['Alice', 'Luca', 'Google italiano', 'it-IT-Premium'];
    for (const name of preferredNames) {
        const voice = italianVoices.find(v => v.name.includes(name));
        if (voice) return voice;
    }

    // Otherwise, prefer voices explicitly marked as it-IT
    const itITVoice = italianVoices.find(v => v.lang === 'it-IT');
    if (itITVoice) return itITVoice;

    // Fall back to first Italian voice
    return italianVoices[0];
}

function speak(text) {
    if (!window.speechSynthesis) {
        console.warn('Speech synthesis not supported');
        return;
    }

    window.speechSynthesis.cancel();

    // Ensure voices are loaded
    if (!bestItalianVoice) {
        bestItalianVoice = findBestItalianVoice();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'it-IT';
    utterance.rate = 0.9;

    if (bestItalianVoice) {
        utterance.voice = bestItalianVoice;
    }

    window.speechSynthesis.speak(utterance);
}

function initializeVoices() {
    if (window.speechSynthesis) {
        // Voices may load asynchronously
        window.speechSynthesis.onvoiceschanged = () => {
            bestItalianVoice = findBestItalianVoice();
        };
        // Try loading immediately too
        bestItalianVoice = findBestItalianVoice();
    }
}

export { speak, initializeVoices };
