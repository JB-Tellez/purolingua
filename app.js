// State
let currentDeck = null;
let currentCardIndex = 0;
let dueCardIndices = []; // Indices of cards due for review today
let isQuizAnswered = false;
let progress = {}; // Stores card progress: { "deckId_cardIndex": { box: 1-3, nextReview: "YYYY-MM-DD" } }

// DOM Elements
const deckSelectionView = document.getElementById('deck-selection');
const flashcardView = document.getElementById('flashcard-view');
const deckGrid = document.getElementById('deck-grid');
const backButton = document.getElementById('back-button');

const currentCard = document.getElementById('current-card');
const cardFrontText = document.getElementById('card-front-text');
const quizOptionsContainer = document.getElementById('quiz-options');
const progressFill = document.getElementById('progress-fill');

const flipBtn = document.getElementById('flip-btn');
const nextBtn = document.getElementById('next-btn');

const audioBtnFront = document.getElementById('audio-btn-front');
const feedbackMessage = document.getElementById('feedback-message');
const resetProgressBtn = document.getElementById('reset-progress-btn');

// Modal Elements
const modal = document.getElementById('custom-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

// Custom Modal Functions
function showAlert(title, message) {
    return new Promise((resolve) => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalCancelBtn.style.display = 'none';
        modalConfirmBtn.textContent = 'OK';

        modal.classList.remove('hidden');

        const handleConfirm = () => {
            modal.classList.add('hidden');
            modalConfirmBtn.removeEventListener('click', handleConfirm);
            resolve(true);
        };

        modalConfirmBtn.addEventListener('click', handleConfirm);

        // Close on overlay click
        const overlay = modal.querySelector('.modal-overlay');
        const handleOverlayClick = () => {
            modal.classList.add('hidden');
            overlay.removeEventListener('click', handleOverlayClick);
            modalConfirmBtn.removeEventListener('click', handleConfirm);
            resolve(true);
        };
        overlay.addEventListener('click', handleOverlayClick);
    });
}

function showConfirm(title, message) {
    return new Promise((resolve) => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalCancelBtn.style.display = 'inline-block';
        modalConfirmBtn.textContent = 'Conferma';

        modal.classList.remove('hidden');

        const handleConfirm = () => {
            modal.classList.add('hidden');
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            modal.classList.add('hidden');
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            modalConfirmBtn.removeEventListener('click', handleConfirm);
            modalCancelBtn.removeEventListener('click', handleCancel);
            overlay.removeEventListener('click', handleCancel);
        };

        modalConfirmBtn.addEventListener('click', handleConfirm);
        modalCancelBtn.addEventListener('click', handleCancel);

        // Close on overlay click (same as cancel)
        const overlay = modal.querySelector('.modal-overlay');
        overlay.addEventListener('click', handleCancel);
    });
}

// Feedback
function showFeedback(message, isCorrect) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback-message ' + (isCorrect ? 'correct' : 'incorrect');

    // Hide after 1.5 seconds
    setTimeout(() => {
        feedbackMessage.classList.add('hidden');
    }, 1500);
}

// Progress Management
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

// Initialize
function init() {
    loadProgress();
    renderDecks();
    setupEventListeners();

    // Load voices (especially important for iOS)
    if (window.speechSynthesis) {
        // Voices may load asynchronously
        window.speechSynthesis.onvoiceschanged = () => {
            bestItalianVoice = findBestItalianVoice();
        };
        // Try loading immediately too
        bestItalianVoice = findBestItalianVoice();
    }
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
    decks.forEach(deck => {
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
    currentDeck = deck;

    // Filter to only due cards
    dueCardIndices = [];
    deck.cards.forEach((card, index) => {
        if (isCardDue(deck.id, index)) {
            dueCardIndices.push(index);
        }
    });

    // Check if any cards are due
    if (dueCardIndices.length === 0) {
        showAlert('Completato! ✓', 'Tutto fatto! Torna domani!');
        return;
    }

    currentCardIndex = 0;

    // Switch Views
    deckSelectionView.classList.add('hidden');
    flashcardView.classList.remove('hidden');

    renderCard();
}

// Generate Choices (1 Correct + 3 Foils)
function generateChoices(correctCard, deck) {
    // Filter out the correct card to get potential foils
    const potentialFoils = deck.cards.filter(c => c.back !== correctCard.back);

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

// Render Current Card
function renderCard() {
    if (!currentDeck) return;

    const actualCardIndex = dueCardIndices[currentCardIndex];
    const card = currentDeck.cards[actualCardIndex];
    isQuizAnswered = false;

    // Reset Flip
    currentCard.classList.remove('flipped');

    // Update Content
    setTimeout(() => {
        cardFrontText.textContent = card.front;

        // Generate Quiz Options
        const choices = generateChoices(card, currentDeck);
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

    }, 200);

    // Update Progress (based on due cards, not total cards)
    const progressPercent = ((currentCardIndex + 1) / dueCardIndices.length) * 100;
    progressFill.style.width = `${progressPercent}%`;
}

// Handle Quiz Answer
function handleAnswer(e, choice, btn) {
    e.stopPropagation(); // Prevent card flip if we click button (though buttons are on back)

    if (isQuizAnswered) return; // Prevent multiple guesses
    isQuizAnswered = true;

    const actualCardIndex = dueCardIndices[currentCardIndex];

    if (choice.isCorrect) {
        btn.classList.add('correct');
        showFeedback('✓ Corretto!', true);
        // Update progress: move card up in Leitner box
        updateCardProgress(currentDeck.id, actualCardIndex, true);
    } else {
        btn.classList.add('incorrect');
        showFeedback('Riprova domani', false);
        // Update progress: move card back to box 1
        updateCardProgress(currentDeck.id, actualCardIndex, false);

        // Highlight the correct one
        const buttons = quizOptionsContainer.querySelectorAll('.quiz-btn');
        const correctAnswer = currentDeck.cards[actualCardIndex].back;
        buttons.forEach(b => {
            const textSpan = b.querySelector('span:not(.quiz-audio-icon)');
            if (textSpan && textSpan.textContent === correctAnswer) {
                b.classList.add('correct');
            }
        });
    }
}

// Audio Logic
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
        showAlert('Audio non disponibile', "Il tuo browser non supporta l'audio.");
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
        const actualCardIndex = dueCardIndices[currentCardIndex];
        const card = currentDeck.cards[actualCardIndex];
        speak(card.front);
    });

    // Next Card
    nextBtn.addEventListener('click', () => {
        if (currentCardIndex < dueCardIndices.length - 1) {
            currentCardIndex++;
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
    currentDeck = null;
    currentCardIndex = 0;
    dueCardIndices = [];
    deckSelectionView.classList.remove('hidden');
    flashcardView.classList.add('hidden');
    // Re-render decks to update due count badges
    renderDecks();
}

async function resetProgress() {
    const confirmed = await showConfirm(
        'Conferma reset',
        'Sei sicuro di voler resettare tutto il progresso? Questa azione non può essere annullata.'
    );

    if (confirmed) {
        // Clear localStorage
        localStorage.removeItem('italiano-progress');
        progress = {};

        // Return to home if in flashcard view
        if (!flashcardView.classList.contains('hidden')) {
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
