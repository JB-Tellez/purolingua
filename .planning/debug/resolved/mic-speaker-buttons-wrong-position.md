---
status: resolved
trigger: "mic-speaker-buttons-wrong-position"
created: 2026-03-10T00:00:00Z
updated: 2026-03-10T00:01:00Z
---

## Current Focus

hypothesis: CONFIRMED — .audio-btn and .mic-btn use position:absolute designed for inside .card-face. In Q&A view they are outside the card face in a plain flex div, so they escape to #flashcard-view (position:relative) and float near the top.
test: read both StudySession and QAStudySession JSX plus style-reference.css
expecting: fix: add class "card-audio-controls" to the Q&A button row div; add CSS rule that resets position to static for buttons inside that wrapper.
next_action: await human verification — confirmed hydration error is pre-existing and unrelated to our change; our fix is correct

## Symptoms

expected: Mic (record) and speaker (play audio) buttons render at the bottom of the flashcard
actual: The two circular buttons appear above the card — seemingly floating at the top of the page, overlapping with a horizontal line/slider element
errors: No JS errors reported — purely a layout/positioning bug
reproduction: Navigate to a Q&A study session (scenario mode) — visible on "Tarjeta 1 de 2" screen with card text "¿Paga en caja o quiere pagar aquí?"
started: Unknown — user just noticed it

## Eliminated

- hypothesis: JavaScript error causing wrong DOM insertion
  evidence: no JS errors reported; DOM structure in JSX clearly shows buttons in a flex div below card-container
  timestamp: 2026-03-10T00:01:00Z

- hypothesis: our className addition caused a hydration mismatch
  evidence: QAStudySession is loaded with ssr:false via dynamic() — it NEVER runs on the server. No server-side HTML is produced for any of its contents. SSR HTML confirmed (both before and after our change) to only contain the SiteHeader and a BAILOUT_TO_CLIENT_SIDE_RENDERING placeholder. Our className cannot appear in SSR HTML and therefore cannot cause a mismatch. The BAILOUT marker was present before our change — confirming the "hydration warning" is a pre-existing benign Next.js dev-mode notice about the dynamic ssr:false component.
  timestamp: 2026-03-11T00:00:00Z

## Evidence

- timestamp: 2026-03-10T00:00:30Z
  checked: QAStudySession.tsx render output
  found: AudioButton and MicButton are in a <div style="display:flex;justify-content:center;gap:0.75rem"> between .card-container and .quiz-options — outside any .card-face
  implication: the flex div has no position set, so position:absolute on the buttons escapes it

- timestamp: 2026-03-10T00:00:40Z
  checked: style-reference.css .audio-btn and .mic-btn rules
  found: both have "position: absolute; top: 2rem; right/left: 2rem" — designed to anchor inside .card-face
  implication: works in rephrase view (buttons inside .card-face which is position:absolute); breaks in Q&A view (buttons outside card face)

- timestamp: 2026-03-10T00:00:50Z
  checked: #flashcard-view CSS
  found: position: relative — the nearest positioned ancestor for the escaped buttons
  implication: buttons anchor at top:2rem of #flashcard-view, overlapping the progress bar area

- timestamp: 2026-03-10T00:01:00Z
  checked: rephrase StudySession.tsx
  found: AudioButton/MicButton are placed as children of .card-face (card-front/card-back) where position:absolute works correctly
  implication: rephrase view is unaffected; only Q&A view has the misplaced buttons

## Resolution

root_cause: .audio-btn and .mic-btn CSS rules use position:absolute (top:2rem, right/left:2rem) designed to pin buttons inside .card-face. In QAStudySession the buttons are rendered in a standalone flex div outside any positioned card face, so they escape to #flashcard-view (position:relative) and float at the top of the page near the progress bar.
fix: add class "card-audio-controls" to the button row div in QAStudySession; add CSS that resets position to static and clears top/right/left for .audio-btn and .mic-btn inside .card-audio-controls, preserving existing behavior in the rephrase card-face context.
verification: self-verified — CSS override correctly scoped; rephrase view buttons inside .card-face are unaffected; Q&A buttons inside .card-audio-controls get position:static and flow in the flex row between card and quiz options
files_changed:
  - src/app/[lang]/qa/[scenario]/QAStudySession.tsx
  - src/style-reference.css
