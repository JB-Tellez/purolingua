// Spanish UI Strings
export default {
    // Language metadata
    meta: {
        code: 'es',
        locale: 'es-ES',
        name: 'Español',
        flag: '🇪🇸',
        direction: 'ltr'
    },

    // Header / Navigation
    nav: {
        logo: 'Español',
        back: '← Atrás',
        reset: 'Reiniciar',
        profile: 'Perfil'
    },

    // Deck Selection
    deckSelection: {
        title: 'Elige un Mazo',
        subtitle: 'Selecciona una categoría para empezar',
        cardCount: '{count} tarjetas',
        completed: 'Completado'
    },

    // Flashcard View
    flashcard: {
        flipButton: 'Voltear',
        nextButton: 'Siguiente',
        listenLabel: 'Escuchar',
        speakLabel: 'Hablar',
        answerLabel: 'Responder'
    },

    // Modal
    modal: {
        ok: 'OK',
        cancel: 'Cancelar',
        confirm: 'Confirmar'
    },

    // Feedback Messages
    feedback: {
        correct: '✓ ¡Correcto!',
        tryAgainTomorrow: 'Inténtalo mañana',
        tryAgain: 'Inténtalo de nuevo',
        wellDone: '¡Muy bien! 🗣️',
        heard: 'Escuché: "{text}"',
        notFound: 'No encontré: "{text}"'
    },

    // Alerts
    alerts: {
        deckCompleteTitle: '¡Completado! ✓',
        deckCompleteMessage: '¡Todo listo! ¡Vuelve mañana!',
        allCardsCompleteTitle: '¡Felicidades! 🎉',
        allCardsCompleteMessage: '¡Completaste todas las tarjetas! ¡Vuelve mañana para más!',
        resetConfirmTitle: 'Confirmar reinicio',
        resetConfirmMessage: '¿Estás seguro de que quieres reiniciar todo el progreso? Esta acción no se puede deshacer.',
        resetCompleteTitle: 'Completado',
        resetCompleteMessage: '¡Progreso reiniciado con éxito!'
    },

    // Preferred voice names for text-to-speech
    voices: {
        preferred: ['Monica', 'Jorge', 'Google español', 'es-ES-Premium', 'Paulina']
    }
};
