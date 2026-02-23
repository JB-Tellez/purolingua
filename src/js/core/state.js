// State Management - Centralized application state
import { getLocaleDecks } from './i18n.js';

let currentDeck = null;
let currentCardIndex = 0;
let dueCardIndices = [];
let isQuizAnswered = false;
let activeLevels = ['A1']; // default; overwritten by initActiveLevels() at app init

// Getters
function getDecks() {
    // Dynamically return decks for the current locale
    return getLocaleDecks();
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

function getActiveLevels() {
    return [...activeLevels]; // return copy to prevent external mutation (Pitfall 5)
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

function setActiveLevels(levels) {
    if (!levels || levels.length === 0) return; // FLTR-06: silent no-op on empty/null
    activeLevels = [...levels]; // store copy
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
    getActiveLevels,
    setCurrentDeck,
    setCurrentCardIndex,
    incrementCardIndex,
    setDueCardIndices,
    setIsQuizAnswered,
    setActiveLevels,
    resetDeckState
};
