# Italiano - Language Learning Flashcard App

## Overview

This is a **learning exercise** focused on using AI to make changes to an existing application. The app is a functional Italian language learning tool that uses flashcards and spaced repetition to help users learn vocabulary.

**⚠️ Important: Only use company-approved AI tools for this exercise.**

## Exercise Goal

**Port this Italian language learning app to another spoken language of your team's choice.**

The primary objective is to practice using AI assistants to understand, modify, and test existing code. This exercise does not require coding experience, though developers are welcome to review and edit code directly.

## Getting Started

### Option 1: With Git (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd italiano
   ```

2. **Create a team branch**
   - Use your team name as a prefix (e.g., `artichoke-prod`, `broccoli-localization`)
   ```bash
   git checkout -b <teamname>-<descriptive-name>
   ```

3. **Make your changes on your team branch**

4. **Follow standard git practices** (commit regularly, write clear commit messages, push to remote)

### Option 2: Without Git

If your team is not experienced with Git:

1. Download the repository as a ZIP file
2. Extract and work on the files locally
3. Keep backups of your work manually

## Running the App

This app is a simple HTML/CSS/JavaScript application that **runs without a server**.

**To run:**
1. Open `index.html` in a web browser
2. That's it!

**Optional:** If your team has experience with local servers, feel free to use one (e.g., `python -m http.server` or `npx serve`).

## Team Collaboration

- **Teams can work together** or **break into smaller groups** to create different language versions
- Each group should work on their own branch (if using Git) or in their own directory (if not using Git)
- Communication and coordination are key!

## Testing Requirements

### Automated Tests (Stretch Goal)
Automated tests are **not required** but can be added as a stretch goal for teams interested in learning test automation.

### Acceptance Criteria (Required)
**Gherkin-style acceptance criteria are required** to confirm correct behavior of your ported app.

#### What is Gherkin?
Gherkin uses a Given-When-Then format to describe behavior:

```gherkin
Feature: Deck Selection

  Scenario: User selects a deck of cards
    Given I am on the deck selection page
    When I click on a deck
    Then I should see the flashcard view
    And I should see the first due card
```

#### Characterization Testing
Before writing acceptance criteria, you must **understand the current behavior** of the app through characterization testing:

1. **Explore the app thoroughly**
   - Click every button
   - Try every feature
   - Observe what happens in different scenarios
   - Use the browser's console to inspect application progress in local storage

2. **Document the current behavior**
   - What does each screen do?
   - How does navigation work?
   - What happens when you answer correctly vs. incorrectly?
   - How does the spaced repetition system work?

3. **Write Gherkin scenarios** that capture this behavior
   - These scenarios should apply to both the original app AND your ported version
   - The behavior should remain the same, only the language changes

## Expected Outcome

By the end of this exercise, your team should have:

1. ✅ A **running version** of the app ported to your chosen language
2. ✅ **Gherkin-style acceptance criteria** that describes the app's behavior
3. ✅ **Confirmation** that your ported app meets all acceptance criteria

## Current App Features

- **Deck Selection**: Choose from multiple flashcard decks
- **Flashcard Quiz**: Multiple-choice questions to test knowledge
- **Spaced Repetition**: Leitner box system with 3 levels (1 day, 3 days, 7 days)
- **Audio Support**: Text-to-speech pronunciation
- **Progress Tracking**: Saves progress in browser localStorage
- **Due Card Indicators**: Shows how many cards are due for review

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (no frameworks)
- Web Speech API (for text-to-speech)
- localStorage (for persistence)

## Tips for Success

1. **Start by understanding** - Use AI to explain how the code works
2. **Test frequently** - Open the app in your browser after each change
3. **Ask questions** - Use AI to help you understand what each piece of code does
4. **Document your acceptance criteria early** - This helps ensure you don't miss any features
5. **Commit often** (if using Git) - Small, incremental changes are easier to manage
6. **Communicate with your team** - Share what you're learning!

## Questions?

This is a learning exercise - there are no wrong questions! Use your AI assistant to help you understand and make progress.

Have fun! 🚀
