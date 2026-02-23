// Deck Utilities - Helper functions for deck operations

// Utility: Fisher-Yates Shuffle
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Generate Choices (1 Correct + 3 Foils)
function generateChoices(correctCard, filteredCards) {
    // filteredCards is already the level-filtered subset of deck.cards
    const potentialFoils = filteredCards.filter(c => c.back !== correctCard.back);

    // Shuffle potential foils
    const shuffledFoils = potentialFoils.sort(() => 0.5 - Math.random());

    // Take top 3 (or fewer if deck is small, though we aim for 4+ cards)
    const foils = shuffledFoils.slice(0, 3);

    // Combine with correct answer
    const choices = [
        { text: correctCard.back, isCorrect: true },
        ...foils.map(f => ({ text: f.back, isCorrect: false }))
    ];

    // Shuffle choices so correct answer isn't always first
    return choices.sort(() => 0.5 - Math.random());
}

export {
    shuffleArray,
    generateChoices
};
