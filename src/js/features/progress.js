// Progress Management - Leitner Box System for Spaced Repetition
let progress = {}; // Stores card progress: { "deckId_cardIndex": { box: 1-3, nextReview: "YYYY-MM-DD" } }

function loadProgress() {
    try {
        const saved = localStorage.getItem('italiano-progress');
        progress = saved ? JSON.parse(saved) : {};
    } catch (e) {
        console.warn('Failed to load progress from localStorage:', e);
        progress = {};
    }
}

function saveProgress() {
    try {
        localStorage.setItem('italiano-progress', JSON.stringify(progress));
    } catch (e) {
        console.warn('Failed to save progress to localStorage:', e);
    }
}

function getCardKey(deckId, cardIndex) {
    return `${deckId}_${cardIndex}`;
}

function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
}

function addDays(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

function getNextReviewDate(box) {
    const today = getTodayString();
    if (box === 1) return addDays(today, 1);  // Tomorrow
    if (box === 2) return addDays(today, 3);  // 3 days
    if (box === 3) return addDays(today, 7);  // 7 days
    return today;
}

function isCardDue(deckId, cardIndex) {
    const key = getCardKey(deckId, cardIndex);
    const cardProgress = progress[key];

    if (!cardProgress) return true; // New cards are due

    const today = getTodayString();
    return cardProgress.nextReview <= today;
}

function updateCardProgress(deckId, cardIndex, isCorrect) {
    const key = getCardKey(deckId, cardIndex);
    const cardProgress = progress[key] || { box: 1, nextReview: getTodayString() };

    if (isCorrect) {
        // Move up one box (max 3)
        cardProgress.box = Math.min(cardProgress.box + 1, 3);
    } else {
        // Back to box 1
        cardProgress.box = 1;
    }

    cardProgress.nextReview = getNextReviewDate(cardProgress.box);
    progress[key] = cardProgress;
    saveProgress();
}

function getDueCount(deck) {
    let count = 0;
    deck.cards.forEach((card, index) => {
        if (isCardDue(deck.id, index)) {
            count++;
        }
    });
    return count;
}

function resetAllProgress() {
    localStorage.removeItem('italiano-progress');
    progress = {};
}

export {
    loadProgress,
    saveProgress,
    isCardDue,
    updateCardProgress,
    getDueCount,
    resetAllProgress
};
