// State Management - Centralized application state

let decks = window.DECKS_DATA || [];
let currentDeck = null;
let currentCardIndex = 0;
let dueCardIndices = [];
let isQuizAnswered = false;

// Getters
function getDecks() {
    return decks;
}

function getCurrentDeck() {
    return currentDeck;
}

function getCurrentCardIndex() {
    return currentCardIndex;
}

function getDueCardIndices() {
    return dueCardIndices;
}

function getIsQuizAnswered() {
    return isQuizAnswered;
}

// Setters
function setCurrentDeck(deck) {
    currentDeck = deck;
}

function setCurrentCardIndex(index) {
    currentCardIndex = index;
}

function incrementCardIndex() {
    currentCardIndex++;
}

function setDueCardIndices(indices) {
    dueCardIndices = indices;
}

function setIsQuizAnswered(value) {
    isQuizAnswered = value;
}

function resetDeckState() {
    currentDeck = null;
    currentCardIndex = 0;
    dueCardIndices = [];
}

export {
    getDecks,
    getCurrentDeck,
    getCurrentCardIndex,
    getDueCardIndices,
    getIsQuizAnswered,
    setCurrentDeck,
    setCurrentCardIndex,
    incrementCardIndex,
    setDueCardIndices,
    setIsQuizAnswered,
    resetDeckState
};
