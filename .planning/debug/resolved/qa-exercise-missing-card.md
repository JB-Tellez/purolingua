---
status: resolved
trigger: "qa-exercise-missing-card"
created: 2026-03-13T00:00:00Z
updated: 2026-03-13T00:02:00Z
---

## Current Focus

hypothesis: CONFIRMED — .card-container has height: 500px (designed for flip-card in [deck].vue). QA scenario page wraps only the question in .card-container, leaving 450px empty space that pushes choice buttons off-screen.
test: Remove class="card-container" from the question div in [scenario].vue
expecting: Choice buttons appear directly below the question with no giant gap
next_action: RESOLVED — human confirmed fix works

## Symptoms

expected: A card or interactive exercise element should appear in the middle of the screen between the prompt and the answer
actual: The middle of the screen is completely blank — no card, no choices, no input, no UI element visible
errors: None reported
reproduction: Navigate to /it/qa/coffee (or any QA scenario), see card 1 of 8
started: Unknown
location: app/pages/qa/[scenario].vue

## Eliminated

- hypothesis: v-if prevents choice buttons from rendering
  evidence: choices computed would be empty only if currentCard is null, but question text IS showing, proving currentCard is valid and choices array is populated
  timestamp: 2026-03-13T00:01:00Z

- hypothesis: CSS visibility/display hides buttons
  evidence: .quiz-options and .quiz-btn CSS look fine; no visibility:hidden or display:none
  timestamp: 2026-03-13T00:01:00Z

## Evidence

- timestamp: 2026-03-13T00:00:00Z
  checked: app/pages/rephrase/ and app/components/
  found: QA pages live at app/pages/qa/ — [scenario].vue is the active card page
  implication: Must investigate [scenario].vue, not [deck].vue

- timestamp: 2026-03-13T00:00:30Z
  checked: app/pages/qa/[scenario].vue template
  found: Question wrapped in <div class="card-container"> — same CSS class used for flip cards in [deck].vue
  implication: .card-container has height: 500px — this creates huge empty space after the question text

- timestamp: 2026-03-13T00:00:45Z
  checked: app/assets/css/main.css (.card-container rule at line 398)
  found: .card-container { height: 500px; perspective: 1000px; } — fixed 500px height designed for 3D flip card
  implication: In [scenario].vue the question text only uses a tiny portion of the 500px box; .quiz-options div renders below it at ~500px offset, likely below viewport fold

- timestamp: 2026-03-13T00:01:00Z
  checked: src/data/qa/caffe.ts card 1
  found: question='Buongiorno! Cosa desidera?', foils include 'Mi chiamo Luca.' — matches screenshot exactly
  implication: The visible "Mi chiamo Luca." at the bottom of the screenshot is a ChoiceButton rendering at the viewport bottom edge; other 3 buttons are below the fold

## Resolution

root_cause: app/pages/qa/[scenario].vue wraps the question div with class="card-container", which has a fixed height: 500px in main.css. This class was designed for the 3D flip card in [deck].vue. In the QA scenario page, only the question text and audio button occupy the top of this 500px box, creating ~450px of dead space that pushes the .quiz-options choice buttons off-screen below the viewport.
fix: Removed class="card-container" from the question wrapper div in app/pages/qa/[scenario].vue. Kept the inline margin style and added text-align:center. The 500px fixed height from .card-container no longer applies to the question wrapper.
verification: Human confirmed — choice buttons now appear below the question
files_changed:
  - app/pages/qa/[scenario].vue
