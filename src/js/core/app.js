// Imports
import { speak, initializeVoices } from '../features/audio.js';
import { VoiceRecognitionService } from '../features/voice.js';
import { loadProgress, isCardDue, updateCardProgress, getDueCount, resetAllProgress } from '../features/progress.js';
import { initializeUIElements, showAlert, showConfirm, showFeedback } from '../features/ui.js';
import { shuffleArray, generateChoices } from '../utils/deck-utils.js';
import { initializeViewElements, switchToFlashcardView, switchToDeckSelectionView, isFlashcardViewVisible } from './views.js';
import { getDecks, getCurrentDeck, getCurrentCardIndex, getDueCardIndices, getIsQuizAnswered, setCurrentDeck, setCurrentCardIndex, incrementCardIndex, setDueCardIndices, setIsQuizAnswered, resetDeckState } from './state.js';
import { t, getLocaleMeta, getLocale, setLocale, getAvailableLocales, hasLanguagePreference } from './i18n.js';

// Sync URL with current locale on page load
function syncURLWithLocale() {
    const url = new URL(window.location);
    const currentLang = url.searchParams.get('lang');
    const locale = getLocale();

    if (currentLang !== locale) {
        url.searchParams.set('lang', locale);
        window.history.replaceState({}, '', url);
    }
}

// Show language selection modal for first-time visitors
function showLanguageSelectionModal() {
    const modal = document.getElementById('language-modal');
    const choicesContainer = document.getElementById('language-choices');

    if (!modal || !choicesContainer) return;

    // Populate language choices
    const locales = getAvailableLocales();
    choicesContainer.innerHTML = '';

    locales.forEach(locale => {
        const choice = document.createElement('div');
        choice.className = 'language-choice';
        choice.innerHTML = `
            <span class="flag">${locale.flag}</span>
            <span class="name">${locale.name}</span>
        `;
        choice.addEventListener('click', () => {
            selectInitialLanguage(locale.code);
        });
        choicesContainer.appendChild(choice);
    });

    // Show modal
    modal.classList.remove('hidden');
}

// Handle initial language selection
function selectInitialLanguage(localeCode) {
    // Hide modal
    document.getElementById('language-modal').classList.add('hidden');

    // Set the locale
    setLocale(localeCode);

    // Now initialize the full app
    initializeApp();
}

// Full app initialization (called after language is chosen)
function initializeApp() {
    syncURLWithLocale();
    initializeI18n();
    updateLanguageSelectorUI();
    setupLanguageSelector();
    initializeViewElements();
    initializeUIElements();
    loadProgress();
    renderDecks();
    setupEventListeners();
    initializeVoices();

    if (voiceService.isSupported()) {
        micBtnFront.classList.remove('hidden');
        micBtnBack.classList.remove('hidden');
    }
}

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
const micBtnFront = document.getElementById('mic-btn-front');
const micBtnBack = document.getElementById('mic-btn-back');
const resetProgressBtn = document.getElementById('reset-progress-btn');

const voiceService = new VoiceRecognitionService();
let currentQuizChoices = [];

// Initialize i18n strings in the DOM
function initializeI18n() {
    const meta = getLocaleMeta();

    // Set document language
    document.documentElement.lang = meta.code;

    // Set logo with flag and name
    const logo = document.getElementById('logo');
    if (logo) {
        logo.textContent = `${meta.flag} ${meta.name}`;
    }

    // Populate all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // Populate all data-i18n-aria elements (for aria-label)
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        el.setAttribute('aria-label', t(key));
    });
}

// Update Language Selector UI (called on init and language switch)
function updateLanguageSelectorUI() {
    const languageBtn = document.getElementById('language-btn');
    const languageDropdown = document.getElementById('language-dropdown');

    if (!languageBtn || !languageDropdown) return;

    const locales = getAvailableLocales();
    const currentLocale = getLocale();
    const currentLocaleData = locales.find(l => l.code === currentLocale);

    // Set button to show current language flag
    languageBtn.textContent = currentLocaleData ? currentLocaleData.flag : '🌐';

    // Populate dropdown
    languageDropdown.innerHTML = '';
    locales.forEach(locale => {
        const option = document.createElement('div');
        option.className = 'language-option' + (locale.code === currentLocale ? ' active' : '');
        option.innerHTML = `<span class="flag">${locale.flag}</span> ${locale.name}`;
        option.addEventListener('click', () => switchLanguage(locale.code));
        languageDropdown.appendChild(option);
    });
}

// Setup Language Selector event listeners (called once on init)
function setupLanguageSelector() {
    const languageBtn = document.getElementById('language-btn');
    const languageDropdown = document.getElementById('language-dropdown');

    if (!languageBtn || !languageDropdown) return;

    // Toggle dropdown on button click (only if not disabled)
    languageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (languageBtn.disabled) return;
        languageDropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        languageDropdown.classList.add('hidden');
    });
}

// Enable/disable language selector
function setLanguageSelectorEnabled(enabled) {
    const languageBtn = document.getElementById('language-btn');
    if (languageBtn) {
        languageBtn.disabled = !enabled;
    }
}

// Switch language and reload UI
function switchLanguage(localeCode) {
    if (localeCode === getLocale()) return;

    setLocale(localeCode);

    // Reload progress for new language
    loadProgress();

    // Re-initialize UI with new language
    initializeI18n();
    updateLanguageSelectorUI();

    // Re-render decks with new language content
    renderDecks();

    // Close dropdown
    document.getElementById('language-dropdown').classList.add('hidden');
}

// Initialize
function init() {
    // Check if user has chosen a language before
    if (hasLanguagePreference()) {
        // Language already chosen, initialize app directly
        initializeApp();
    } else {
        // First visit - show language selection modal
        showLanguageSelectionModal();
    }
}

// Render Decks
function renderDecks() {
    deckGrid.innerHTML = '';
    getDecks().forEach(deck => {
        // Skip decks that don't have a theme (optional, if we want to hide Social/Weather)
        if (!deck.theme) return;

        const dueCount = getDueCount(deck);
        const card = document.createElement('div');
        card.className = `deck-card theme-${deck.theme}`;

        const badgeText = dueCount > 0 ? t('deckSelection.cardCount', { count: dueCount }) : t('deckSelection.completed');

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
        showAlert(t('alerts.deckCompleteTitle'), t('alerts.deckCompleteMessage'));
        return;
    }

    // Randomize the order of cards
    setDueCardIndices(shuffleArray(tempDueIndices));

    setCurrentCardIndex(0);

    // Switch Views
    switchToFlashcardView();
    setLanguageSelectorEnabled(false);

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
    currentQuizChoices = choices;
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
        showFeedback(t('feedback.correct'), true);
        // Update progress: move card up in Leitner box
        updateCardProgress(getCurrentDeck().id, actualCardIndex, true);
    } else {
        btn.classList.add('incorrect');
        showFeedback(t('feedback.tryAgainTomorrow'), false);
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
        // Don't flip if clicking audio, quiz, or mic buttons
        const clickedElement = e.target;

        // Check if we clicked on or inside an interactive element
        if (clickedElement.closest('.audio-btn') ||
            clickedElement.closest('.quiz-btn') ||
            clickedElement.closest('.mic-btn') ||
            clickedElement.closest('#mic-btn-front') ||
            clickedElement.closest('#mic-btn-back') ||
            clickedElement.closest('#audio-btn-front')) {
            e.stopImmediatePropagation();
            return;
        }

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

    // Voice Recognition Button
    micBtnFront.addEventListener('click', (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (voiceService.isListening) {
            voiceService.stopListening();
            micBtnFront.classList.remove('listening');
            return;
        }

        micBtnFront.classList.add('listening');

        voiceService.startListening(
            (transcript) => {
                micBtnFront.classList.remove('listening');
                console.log('Heard:', transcript);

                const normalize = (text) => text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
                const spoken = normalize(transcript);
                const expected = normalize(cardFrontText.textContent);

                // Fuzzy match: check if one contains the other (allows for partial phrases or extra noise)
                // Also check Levenshtein distance if needed, but simple includes is good start
                if (spoken.includes(expected) || expected.includes(spoken) || spoken === expected) {
                    showFeedback(t('feedback.wellDone'), true);
                    currentCard.classList.add('flipped');
                } else {
                    showFeedback(t('feedback.heard', { text: transcript }), false);
                }
            },
            (error) => {
                console.error('Voice error:', error);
                micBtnFront.classList.remove('listening');
                showFeedback(t('feedback.tryAgain'), false);
            },
            () => {
                micBtnFront.classList.remove('listening');
            }
        );
    });

    // Voice Quiz Button (Back)
    micBtnBack.addEventListener('click', (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (voiceService.isListening) {
            voiceService.stopListening();
            micBtnBack.classList.remove('listening');
            return;
        }

        micBtnBack.classList.add('listening');

        voiceService.startListening(
            (transcript) => {
                micBtnBack.classList.remove('listening');
                console.log('Heard (Back):', transcript);

                const normalize = (text) => text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
                const spoken = normalize(transcript);

                // Find matching choice
                const matchIndex = currentQuizChoices.findIndex(choice => {
                    const optionText = normalize(choice.text);
                    return spoken.includes(optionText) || optionText.includes(spoken) || spoken === optionText;
                });

                if (matchIndex !== -1) {
                    const choice = currentQuizChoices[matchIndex];
                    const buttons = quizOptionsContainer.querySelectorAll('.quiz-btn');
                    const btn = buttons[matchIndex];

                    if (btn) {
                        // Simulate click or call handleAnswer directly
                        // We need to pass a valid event object or handle null in handleAnswer. 
                        // handleAnswer uses e.stopPropagation(), so we mock it.
                        handleAnswer({ stopPropagation: () => { } }, choice, btn);
                    }
                } else {
                    showFeedback(t('feedback.notFound', { text: transcript }), false);
                }
            },
            (error) => {
                console.error('Voice error:', error);
                micBtnBack.classList.remove('listening');
                showFeedback(t('feedback.tryAgain'), false);
            },
            () => {
                micBtnBack.classList.remove('listening');
            }
        );
    });

    // Next Card

    // Next Card
    nextBtn.addEventListener('click', () => {
        if (getCurrentCardIndex() < getDueCardIndices().length - 1) {
            incrementCardIndex();
            renderCard();
        } else {
            showAlert(t('alerts.allCardsCompleteTitle'), t('alerts.allCardsCompleteMessage')).then(() => {
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
    setLanguageSelectorEnabled(true);
    // Re-render decks to update due count badges
    renderDecks();
}

async function resetProgress() {
    const confirmed = await showConfirm(
        t('alerts.resetConfirmTitle'),
        t('alerts.resetConfirmMessage')
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

        await showAlert(t('alerts.resetCompleteTitle'), t('alerts.resetCompleteMessage'));
    }
}

// Run Init
document.addEventListener('DOMContentLoaded', init);
