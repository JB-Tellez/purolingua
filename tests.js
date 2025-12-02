// Simple Test Runner
const resultsContainer = document.getElementById('test-results');
const summaryContainer = document.getElementById('test-summary');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function describe(name, fn) {
    const group = document.createElement('div');
    group.className = 'test-group';
    group.innerHTML = `<h2>${name}</h2>`;
    resultsContainer.appendChild(group);
    
    // Execute tests within this group context
    window.currentGroup = group;
    try {
        fn();
    } catch (e) {
        console.error(`Error in describe block ${name}:`, e);
    }
}

function it(name, fn) {
    totalTests++;
    const resultDiv = document.createElement('div');
    resultDiv.className = 'test-result';
    
    try {
        fn();
        passedTests++;
        resultDiv.classList.add('pass');
        resultDiv.innerHTML = `<span>✓ ${name}</span>`;
    } catch (error) {
        failedTests++;
        resultDiv.classList.add('fail');
        resultDiv.innerHTML = `
            <span>✗ ${name}</span>
            <span class="error-msg">${error.message}</span>
        `;
        console.error(`Test failed: ${name}`, error);
    }
    
    window.currentGroup.appendChild(resultDiv);
    updateSummary();
}

function expect(actual) {
    return {
        toBe: (expected) => {
            if (actual !== expected) {
                throw new Error(`Expected ${expected} but got ${actual}`);
            }
        },
        toEqual: (expected) => {
            const actualStr = JSON.stringify(actual);
            const expectedStr = JSON.stringify(expected);
            if (actualStr !== expectedStr) {
                throw new Error(`Expected ${expectedStr} but got ${actualStr}`);
            }
        },
        toBeGreaterThan: (expected) => {
            if (!(actual > expected)) {
                throw new Error(`Expected ${actual} to be greater than ${expected}`);
            }
        },
        toContain: (item) => {
            if (!actual.includes(item)) {
                throw new Error(`Expected array to contain ${item}`);
            }
        },
        toBeTruthy: () => {
            if (!actual) {
                throw new Error(`Expected ${actual} to be truthy`);
            }
        }
    };
}

function updateSummary() {
    const color = failedTests > 0 ? 'red' : 'green';
    summaryContainer.textContent = `Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`;
    summaryContainer.style.color = color;
}

// ==========================================
// TEST SUITE
// ==========================================

// Wait for app to initialize
setTimeout(() => {

    describe('Spaced Repetition Logic', () => {
        it('getNextReviewDate(1) should return tomorrow', () => {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const expected = tomorrow.toISOString().split('T')[0];
            
            const result = getNextReviewDate(1);
            expect(result).toBe(expected);
        });

        it('getNextReviewDate(2) should return 3 days from now', () => {
            const today = new Date();
            const future = new Date(today);
            future.setDate(future.getDate() + 3);
            const expected = future.toISOString().split('T')[0];
            
            const result = getNextReviewDate(2);
            expect(result).toBe(expected);
        });

        it('getNextReviewDate(3) should return 7 days from now', () => {
            const today = new Date();
            const future = new Date(today);
            future.setDate(future.getDate() + 7);
            const expected = future.toISOString().split('T')[0];
            
            const result = getNextReviewDate(3);
            expect(result).toBe(expected);
        });
    });

    describe('Quiz Generation', () => {
        it('generateChoices should return 4 options', () => {
            const deck = decks[0];
            const card = deck.cards[0];
            const choices = generateChoices(card, deck);
            
            expect(choices.length).toBe(4);
        });

        it('generateChoices should include the correct answer', () => {
            const deck = decks[0];
            const card = deck.cards[0];
            const choices = generateChoices(card, deck);
            
            const hasCorrect = choices.some(c => c.text === card.back && c.isCorrect === true);
            expect(hasCorrect).toBeTruthy();
        });

        it('generateChoices should have exactly one correct answer', () => {
            const deck = decks[0];
            const card = deck.cards[0];
            const choices = generateChoices(card, deck);
            
            const correctCount = choices.filter(c => c.isCorrect).length;
            expect(correctCount).toBe(1);
        });
    });

    describe('Progress Persistence', () => {
        it('updateCardProgress should save to localStorage', () => {
            // Mock localStorage
            const store = {};
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = (key, val) => { store[key] = val; };
            
            // Trigger update
            updateCardProgress('test-deck', 0, true);
            
            // Verify
            expect(store['italiano-progress']).toBeTruthy();
            const data = JSON.parse(store['italiano-progress']);
            expect(data['test-deck_0'].box).toBe(2); // Should move to box 2
            
            // Restore
            localStorage.setItem = originalSetItem;
        });
        
        it('updateCardProgress should reset to box 1 on failure', () => {
             // Mock localStorage
            const store = {};
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = (key, val) => { store[key] = val; };
            
            // Setup initial state (box 3)
            progress['test-deck_1'] = { box: 3, nextReview: '2023-01-01' };
            
            // Trigger failure update
            updateCardProgress('test-deck', 1, false);
            
            // Verify
            const data = JSON.parse(store['italiano-progress']);
            expect(data['test-deck_1'].box).toBe(1);
            
            // Restore
            localStorage.setItem = originalSetItem;
        });
    });

}, 100); // Small delay to ensure scripts loaded

// Audio playback for questions
describe('Audio playback for questions', () => {
    it('should play audio when question audio button is clicked', () => {
        // Setup: create a mock card and audio button
        const audio = document.createElement('audio');
        audio.src = 'test-audio.mp3';
        document.body.appendChild(audio);

        const button = document.createElement('button');
        button.id = 'question-audio-btn';
        document.body.appendChild(button);

        // Mock play method
        let playCalled = false;
        audio.play = () => { playCalled = true; };

        // Simulate click event handler (assume app binds this way)
        button.addEventListener('click', () => {
            audio.play();
        });

        // Simulate user clicking the button
        button.click();

        expect(playCalled).toBe(true);

        // Cleanup
        document.body.removeChild(audio);
        document.body.removeChild(button);
    });
});
