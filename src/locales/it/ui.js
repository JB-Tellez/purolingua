// Italian UI Strings
export default {
    // Language metadata
    meta: {
        code: 'it',
        locale: 'it-IT',
        name: 'Italiano',
        flag: '🇮🇹',
        direction: 'ltr'
    },

    // Header / Navigation
    nav: {
        logo: 'Italiano',
        back: '← Indietro',
        reset: 'Reset',
        profile: 'Profilo'
    },

    // Deck Selection
    deckSelection: {
        title: 'Scegli un Mazzo',
        subtitle: 'Seleziona una categoria per iniziare',
        cardCount: '{count} carte',
        completed: 'Completato'
    },

    // Streak Banner
    streak: {
        daysInARow: '{count} giorni di fila!',
        keepItUp: 'Continua così'
    },

    // Flashcard View
    flashcard: {
        flipButton: 'Gira',
        nextButton: 'Prossimo',
        listenLabel: 'Ascolta',
        speakLabel: 'Parla',
        answerLabel: 'Rispondi'
    },

    // Modal
    modal: {
        ok: 'OK',
        cancel: 'Annulla',
        confirm: 'Conferma'
    },

    // Feedback Messages
    feedback: {
        correct: '✓ Corretto!',
        tryAgainTomorrow: 'Riprova domani',
        tryAgain: 'Riprova',
        wellDone: 'Bravo! 🗣️',
        heard: 'Ho sentito: "{text}"',
        notFound: 'Non ho trovato: "{text}"'
    },

    // Alerts
    alerts: {
        deckCompleteTitle: 'Completato! ✓',
        deckCompleteMessage: 'Tutto fatto! Torna domani!',
        allCardsCompleteTitle: 'Complimenti! 🎉',
        allCardsCompleteMessage: 'Hai completato tutte le carte! Torna domani per più!',
        resetConfirmTitle: 'Conferma reset',
        resetConfirmMessage: 'Sei sicuro di voler resettare tutto il progresso? Questa azione non può essere annullata.',
        resetCompleteTitle: 'Completato',
        resetCompleteMessage: 'Progresso resettato con successo!'
    },

    // Preferred voice names for text-to-speech
    voices: {
        preferred: ['Alice', 'Luca', 'Google italiano', 'it-IT-Premium']
    }
};
