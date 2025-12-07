// Imports
import { speak, initializeVoices } from './audio.js';
import { loadProgress, isCardDue, updateCardProgress, getDueCount, resetAllProgress } from './progress.js';
import { initializeUIElements, showAlert, showConfirm, showFeedback } from './ui.js';
import { shuffleArray, generateChoices } from './deck-utils.js';
import { initializeViewElements, switchToFlashcardView, switchToDeckSelectionView, isFlashcardViewVisible } from './views.js';
import { getDecks, getCurrentDeck, getCurrentCardIndex, getDueCardIndices, getIsQuizAnswered, setCurrentDeck, setCurrentCardIndex, incrementCardIndex, setDueCardIndices, setIsQuizAnswered, resetDeckState } from './state.js';

// DOM Elements
const deckGrid = document.getElementById('deck-grid');
const backButton = document.getElementById('back-button');

const currentCard = document.getElementById('current-card');
const cardFrontText = document.getElementById('card-front-text');
const quizOptionsContainer = document.getElementById('quiz-options');
const progressFill = document.getElementById('progress-fill');

const flipBtn = document.getElementById('flip-btn');
const nextBtn = document.getElementById('next-btn');

const audioBtnFront = document.getElementById('audio-btn-front');
const resetProgressBtn = document.getElementById('reset-progress-btn');

// Initialize
function init() {
    initializeViewElements();
    initializeUIElements();
    loadProgress();
    renderDecks();
    setupEventListeners();
    initializeVoices();
}

// Icon Mapping
const deckIcons = {
    'daily': '☀️',
    'restaurant': '🍝',
    'travel': '🗺️',
    'shopping': '🛒',
    'hotel': '🏨',
    'emergencies': '🚨',
    'social': '💬',
    'weather': '☁️'
};

// Render Decks
function renderDecks() {
    deckGrid.innerHTML = '';
    getDecks().forEach(deck => {
        // Skip decks that don't have a theme (optional, if we want to hide Social/Weather)
        if (!deck.theme) return;

        const dueCount = getDueCount(deck);
        const card = document.createElement('div');
        card.className = `deck-card theme-${deck.theme}`;

        const badgeText = dueCount > 0 ? `${dueCount} carte` : 'Completato';

        card.innerHTML = `
            <div class="deck-icon-circle">${deck.icon}</div>
            <div>
                <h3>${deck.title}</h3>
                <p>${deck.description}</p>
            </div>
            <div class="deck-card-badge">${badgeText}</div>
        `;
        card.addEventListener('click', () => startDeck(deck));
        deckGrid.appendChild(card);
    });
}

// Start Deck
function startDeck(deck) {
    setCurrentDeck(deck);

    // Filter to only due cards
    const tempDueIndices = [];
    deck.cards.forEach((card, index) => {
        if (isCardDue(deck.id, index)) {
            tempDueIndices.push(index);
        }
    });

    // Check if any cards are due
    if (tempDueIndices.length === 0) {
        showAlert('Completato! ✓', 'Tutto fatto! Torna domani!');
        return;
    }

    // Randomize the order of cards
    setDueCardIndices(shuffleArray(tempDueIndices));

    setCurrentCardIndex(0);

    // Switch Views
    switchToFlashcardView();

    renderCard();
}

// Render Current Card
function renderCard() {
    if (!getCurrentDeck()) return;

    const actualCardIndex = getDueCardIndices()[getCurrentCardIndex()];
    const card = getCurrentDeck().cards[actualCardIndex];
    setIsQuizAnswered(false);

    // Reset Flip
    currentCard.classList.remove('flipped');

    // Update Content immediately
    cardFrontText.textContent = card.front;

    // Generate Quiz Options
    const choices = generateChoices(card, getCurrentDeck());
    quizOptionsContainer.innerHTML = '';

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';

        // Create audio icon
        const audioIcon = document.createElement('span');
        audioIcon.className = 'quiz-audio-icon';
        audioIcon.textContent = '🔊';
        audioIcon.onclick = (e) => {
            e.stopPropagation();
            speak(choice.text);
        };

        // Create text span
        const textSpan = document.createElement('span');
        textSpan.textContent = choice.text;

        btn.appendChild(audioIcon);
        btn.appendChild(textSpan);
        btn.onclick = (e) => handleAnswer(e, choice, btn);
        quizOptionsContainer.appendChild(btn);
    });

    // Update Progress (based on due cards, not total cards)
    const progressPercent = ((getCurrentCardIndex() + 1) / getDueCardIndices().length) * 100;
    progressFill.style.width = `${progressPercent}%`;
}

// Handle Quiz Answer
function handleAnswer(e, choice, btn) {
    e.stopPropagation(); // Prevent card flip if we click button (though buttons are on back)

    if (getIsQuizAnswered()) return; // Prevent multiple guesses
    setIsQuizAnswered(true);

    const actualCardIndex = getDueCardIndices()[getCurrentCardIndex()];

    if (choice.isCorrect) {
        btn.classList.add('correct');
        showFeedback('✓ Corretto!', true);
        // Update progress: move card up in Leitner box
        updateCardProgress(getCurrentDeck().id, actualCardIndex, true);
    } else {
        btn.classList.add('incorrect');
        showFeedback('Riprova domani', false);
        // Update progress: move card back to box 1
        updateCardProgress(getCurrentDeck().id, actualCardIndex, false);

        // Highlight the correct one
        const buttons = quizOptionsContainer.querySelectorAll('.quiz-btn');
        const correctAnswer = getCurrentDeck().cards[actualCardIndex].back;
        buttons.forEach(b => {
            const textSpan = b.querySelector('span:not(.quiz-audio-icon)');
            if (textSpan && textSpan.textContent === correctAnswer) {
                b.classList.add('correct');
            }
        });
    }
}


// Event Listeners
function setupEventListeners() {
    // Flip
    currentCard.addEventListener('click', (e) => {
        // Don't flip if clicking audio or quiz buttons
        if (e.target.closest('.audio-btn') || e.target.closest('.quiz-btn')) return;
        currentCard.classList.toggle('flipped');
    });

    flipBtn.addEventListener('click', () => {
        currentCard.classList.toggle('flipped');
    });

    // Audio Button (Front only - back options have individual audio icons)
    audioBtnFront.addEventListener('click', (e) => {
        e.stopPropagation();
        const actualCardIndex = getDueCardIndices()[getCurrentCardIndex()];
        const card = getCurrentDeck().cards[actualCardIndex];
        speak(card.front);
    });

    // Next Card
    nextBtn.addEventListener('click', () => {
        if (getCurrentCardIndex() < getDueCardIndices().length - 1) {
            incrementCardIndex();
            renderCard();
        } else {
            showAlert('Complimenti! 🎉', 'Hai completato tutte le carte! Torna domani per più!').then(() => {
                goHome();
            });
        }
    });

    // Back Button
    backButton.addEventListener('click', goHome);

    // Reset Progress Button
    resetProgressBtn.addEventListener('click', (e) => {
        e.preventDefault();
        resetProgress();
    });
}

function goHome() {
    resetDeckState();
    switchToDeckSelectionView();
    // Re-render decks to update due count badges
    renderDecks();
}

async function resetProgress() {
    const confirmed = await showConfirm(
        'Conferma reset',
        'Sei sicuro di voler resettare tutto il progresso? Questa azione non può essere annullata.'
    );

    if (confirmed) {
        // Clear all progress
        resetAllProgress();

        // Return to home if in flashcard view
        if (isFlashcardViewVisible()) {
            goHome();
        } else {
            // Just re-render decks if already on home
            renderDecks();
        }

        await showAlert('Completato', 'Progresso resettato con successo!');
    }
}

// Run Init
document.addEventListener('DOMContentLoaded', init);
