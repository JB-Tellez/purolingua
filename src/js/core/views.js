// View Management - Functions for managing view state and navigation

// DOM Elements (will be initialized on DOM load)
let deckSelectionView, flashcardView, backButton;

function initializeViewElements() {
    deckSelectionView = document.getElementById('deck-selection');
    flashcardView = document.getElementById('flashcard-view');
    backButton = document.getElementById('back-button');
}

function switchToFlashcardView() {
    deckSelectionView.classList.add('hidden');
    flashcardView.classList.remove('hidden');
    backButton.classList.remove('hidden');
}

function switchToDeckSelectionView() {
    deckSelectionView.classList.remove('hidden');
    flashcardView.classList.add('hidden');
    backButton.classList.add('hidden');
}

function isFlashcardViewVisible() {
    return !flashcardView.classList.contains('hidden');
}

export {
    initializeViewElements,
    switchToFlashcardView,
    switchToDeckSelectionView,
    isFlashcardViewVisible
};
