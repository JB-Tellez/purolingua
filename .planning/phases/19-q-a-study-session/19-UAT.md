---
status: resolved
phase: 19-q-a-study-session
source: 19-01-SUMMARY.md, 19-02-SUMMARY.md, 19-03-SUMMARY.md
started: 2026-03-10T23:00:00Z
updated: 2026-03-10T23:50:00Z
---

## Current Test

## Current Test

[testing complete]

## Tests

### 1. Navigate to Q&A Session Page
expected: Open http://localhost:3000/it/qa/coffee (or your local dev URL). The page loads showing a Q&A card with Italian question text, an audio button, and 4 choice buttons below the card.
result: pass

### 2. Select Correct Answer
expected: Click the correct answer button. The button turns green (or shows correct feedback), and the next card loads automatically after ~600ms.
result: pass

### 3. Select Wrong Answer
expected: Click an incorrect answer button. The button turns red (or shows wrong feedback). The card does NOT advance — you stay on the same question.
result: pass

### 4. Audio Button Works
expected: Click the audio button (below the card). The question text is spoken aloud via browser TTS/audio.
result: pass

### 5. Scenario Done Screen
expected: Complete all cards in a scenario (keep answering correctly until no more cards). A "scenario done" screen appears instead of another card, with options to study again or go back.
result: pass

### 6. Study Again from Scenario Done
expected: On the scenario done screen, click "study again" (or equivalent). The session resets and the first card of the scenario appears again.
result: pass

### 7. Back to Scenarios Link
expected: From any point in the Q&A session (or done screen), click the "back to scenarios" link/button. You are taken back to the scenarios list page.
result: pass

### 8. Spanish Variant Loads Correctly
expected: Navigate to http://localhost:3000/es/qa/caffe. The page loads with Spanish content — question text and choices are in Spanish, not Italian.
result: pass

### 9. Invalid Scenario Slug Returns 404
expected: Navigate to http://localhost:3000/it/qa/thisdoesnotexist. The page shows a 404 / "not found" response, not a crash or blank page.
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0

## Gaps

- truth: "Wrong answer shows red feedback and card stays — user must try again"
  status: resolved
  reason: "User reported: it turned red, showed correct in green, and moved on automatically"
  severity: minor
  test: 3
  root_cause: "handleChoiceClick calls setTimeout(() => handleAnswer(isCorrect), 600) unconditionally for both correct and incorrect answers — wrong answers auto-advance identically to correct ones"
  artifacts:
    - path: "src/app/[lang]/qa/[scenario]/QAStudySession.tsx"
      issue: "handleChoiceClick (line 183) schedules handleAnswer via setTimeout for both correct and incorrect choices"
  missing:
    - "Block auto-advance on wrong answer — only call handleAnswer when isCorrect === true"
    - "After wrong-answer feedback delay (~800ms), reset selectedChoice and feedbackState to null so buttons become interactive again"
    - "Skip SRS recording on wrong answer — updateCard should only be called on correct answers"
  debug_session: ""
