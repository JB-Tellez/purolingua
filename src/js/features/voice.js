export class VoiceRecognitionService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.onResultCallback = null;
        this.onErrorCallback = null;
        this.onEndCallback = null;

        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false; // Stop after one sentence
            this.recognition.interimResults = false;
            this.recognition.lang = 'it-IT'; // Default to Italian

            this.recognition.onstart = () => {
                this.isListening = true;
            };

            this.recognition.onend = () => {
                this.isListening = false;
                if (this.onEndCallback) this.onEndCallback();
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (this.onResultCallback) this.onResultCallback(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                if (this.onErrorCallback) this.onErrorCallback(event.error);
            };
        } else {
            console.warn('Web Speech API not supported in this browser.');
        }
    }

    startListening(onResult, onError, onEnd) {
        if (!this.recognition) return;

        // If already listening, stop first (clean restart)
        if (this.isListening) {
            this.recognition.stop();
        }

        this.onResultCallback = onResult;
        this.onErrorCallback = onError;
        this.onEndCallback = onEnd;

        try {
            this.recognition.start();
        } catch (e) {
            console.error("Failed to start recognition:", e);
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    isSupported() {
        return !!this.recognition;
    }
}
