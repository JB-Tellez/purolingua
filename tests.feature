Feature: Spaced Repetition Learning System
  As a language learner
  I want to review flashcards at optimal intervals
  So that I can memorize Italian vocabulary efficiently

  Rule: The Leitner system determines review intervals based on current box
    
    Scenario: Card in Box 1 (New/Difficult)
      Given a card is currently in Box 1
      When I calculate the next review date
      Then the next review date should be 1 day from today

    Scenario: Card in Box 2 (Intermediate)
      Given a card is currently in Box 2
      When I calculate the next review date
      Then the next review date should be 3 days from today

    Scenario: Card in Box 3 (Mastered)
      Given a card is currently in Box 3
      When I calculate the next review date
      Then the next review date should be 7 days from today

  Rule: Quiz choices must be fair and randomized

    Scenario: Generating quiz options
      Given a deck of cards
      And a specific target card to test
      When I generate the quiz choices
      Then I should get exactly 4 options
      And one option should be the correct answer
      And the other 3 options should be foils from other cards in the deck

  Rule: Progress is saved and updated based on performance

    Scenario: User answers correctly
      Given a card is currently in Box 1
      When I answer the quiz correctly
      Then the card should move to Box 2
      And the progress should be saved to local storage

    Scenario: User answers incorrectly
      Given a card is currently in Box 3
      When I answer the quiz incorrectly
      Then the card should be reset to Box 1
      And the progress should be saved to local storage

  Rule: Audio playback for questions

    Scenario: Playing question audio
      Given a card with an associated audio file
      And the question audio button is visible
      When I click the question audio button
      Then the audio for the question should play
