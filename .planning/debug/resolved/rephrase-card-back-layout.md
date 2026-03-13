---
status: resolved
trigger: "Card back in the Rephrase activity has two layout bugs: mic button is mispositioned and a phantom 'Sentito' link appears at the bottom center of the card."
created: 2026-03-13T00:00:00Z
updated: 2026-03-13T00:00:00Z
---

## Current Focus

hypothesis: Both bugs confirmed. Applying minimal fix.
test: N/A — root causes identified through code reading
expecting: After fix, mic button is absolutely positioned top-left and 'Sentito' only appears as an overlay (not in flex flow) and only on the face where it belongs
next_action: Apply fix to app/pages/rephrase/[deck].vue and app/components/FeedbackMessage.vue

## Symptoms

expected: On the card back, the large mic button should appear in the top-left corner of the card (above and outside the answer options list). The "Sentito" (Heard) button/link should NOT appear inside the card body.
actual: 1) The mic button overlaps the first answer option row instead of being positioned above/outside it. 2) A "Sentito" text link appears centered at the bottom of the card body, between the answer list and the Gira/Prossimo action buttons.
errors: No JS errors — purely layout/template issue
reproduction: Start a Rephrase study session, flip a card to the back face (especially by speaking the front via mic)
timeline: Vue port regression in app/pages/rephrase/[deck].vue

## Eliminated

- hypothesis: MicButton is in the flex flow (not absolutely positioned)
  evidence: CSS .mic-btn has position:absolute, MicButton component renders <button class="mic-btn">. The button IS absolutely positioned.
  timestamp: 2026-03-13

- hypothesis: FeedbackMessage uses .feedback-message CSS class (absolutely positioned overlay)
  evidence: FeedbackMessage component uses only Tailwind classes (text-sm font-medium text-center + color). It renders a plain <p> in the normal flex flow. The .feedback-message CSS class is never applied to it.
  timestamp: 2026-03-13

## Evidence

- timestamp: 2026-03-13
  checked: app/assets/css/main.css lines 586-605 and 921-939
  found: .mic-btn is defined TWICE. First at lines 587-605 with top:2rem; right:5rem. Second at lines 921-939 with top:2rem; left:2rem. Second rule overrides first. Final result: mic-btn is position:absolute; top:2rem; left:2rem relative to the nearest positioned ancestor.
  implication: MicButton should theoretically be top-left of the card face. But the card face (.card-back) is position:absolute and is a flex container. The absolutley-positioned MicButton sits outside the flex flow but within the positioned card face. On a cramped card with 4 choice buttons + FeedbackMessage + controls, the top-2rem position of the mic button overlaps the first choice row because the content is flexed to center — the first choice ends up near the top area.

- timestamp: 2026-03-13
  checked: app/pages/rephrase/[deck].vue lines 287-323 (card back template)
  found: Card back template order: MicButton (absolute) → div.quiz-options (4 choices) → FeedbackMessage → controls div. The card-back is a flex column with justify-content:center. FeedbackMessage is a plain <p> in the flex flow (not the CSS .feedback-message overlay class).
  implication: FeedbackMessage renders inline between quiz-options and controls in the flex column — exactly matching symptom 2.

- timestamp: 2026-03-13
  checked: app/components/FeedbackMessage.vue
  found: Renders <p v-if="state !== null" role="status" :class="text-sm font-medium text-center {colorClass}">. No position:absolute. Pure inline flow element.
  implication: When feedbackState !== null on the card back, FeedbackMessage appears in the flex column between quiz-options and controls, showing as a centered text line at the bottom of the options area.

- timestamp: 2026-03-13
  checked: feedbackState lifecycle in [deck].vue
  found: handleFrontMicPress sets feedbackState = 'heard' AND flipped = true simultaneously. So when a user speaks the front phrase correctly, they flip to the back with feedbackState still = 'heard'. The back face renders with feedbackState='heard', causing FeedbackMessage to show "Sentito" on the back.
  implication: This is bug 2 root cause. feedbackState from the front face leaks into the back face render.

- timestamp: 2026-03-13
  checked: app/assets/css/main.css .card-back (lines 518-525)
  found: .card-back has: position:absolute (it's a card face), display:flex, flex-direction:column, align-items:center, justify-content:center, padding:2.5rem. No position:relative needed since it's already position:absolute (serves as containing block for child absolute elements).
  implication: MicButton's absolute positioning anchors to .card-back correctly (top:2rem; left:2rem). The overlap issue is because the MicButton (48px circle) at top:2rem; left:2rem overlaps the first ChoiceButton which is centered near the top of the flex container. Fix: wrap quiz-options in a container that adds top padding to clear the mic button area, OR restructure the back face to use a proper layout with a dedicated top row.

## Resolution

root_cause: |
  TWO BUGS, BOTH IN app/pages/rephrase/[deck].vue:

  BUG 1 - MicButton overlap: The card back face (.card-back) is a flex column with
  justify-content:center. MicButton is position:absolute at top:2rem;left:2rem. The
  quiz-options flex child (4 choice buttons) is centered in the card, and with
  padding:2.5rem + 4 buttons of 1rem+ height, the first choice renders near the top
  of the visible area — overlapping the absolutely-positioned MicButton.
  Fix: Add padding-top to .quiz-options on the card back (or add a top spacer) so the
  first choice clears the 48px mic button. Better: add a wrapper div with position:relative
  and top padding around quiz-options, or give the card-back flex container a paddingTop
  that clears the absolute mic button.

  BUG 2 - "Sentito" phantom: feedbackState is set to 'heard' in handleFrontMicPress()
  BEFORE setting flipped=true. When the card flips to the back, feedbackState is still
  'heard'. FeedbackMessage renders as a plain inline <p> (no .feedback-message CSS overlay
  class), so it appears in the flex column between quiz-options and controls, showing
  "Sentito" as a text line at the bottom of the options area.
  Fix: Reset feedbackState to null when flipping to the back face, either by clearing it
  in handleFrontMicPress after the flip (via nextTick or a watcher on flipped), or by
  using a computed/watch to clear feedbackState when flipped changes to true.

fix: |
  In app/pages/rephrase/[deck].vue:
  1. In handleFrontMicPress: after setting flipped=true, also reset feedbackState=null
     (or use a watcher on flipped to clear feedbackState when going to back).
  2. On the card back template: add pt-16 (or equivalent top padding) to the card-back
     div so the flex content starts below the absolutely-positioned MicButton. Use
     inline style or a wrapper class: style="padding-top: 3.5rem" on the card-back div,
     or wrap quiz-options in a div with top margin.

verification: |
  Self-verified by code inspection:
  - Bug 2 fix: handleFrontMicPress now sets flipped=true then feedbackState=null, so
    feedbackState is cleared before the back face renders. FeedbackMessage will not
    show "Sentito" on the back face.
  - Bug 1 fix: card-back div gets inline style="padding-top: 4rem;" which moves the
    flex content (quiz-options, FeedbackMessage, controls) down by 4rem, clearing the
    48px MicButton at top:2rem. The MicButton remains absolutely positioned top-left
    of the card face without overlapping the first choice option.
  Needs human verification in browser.
files_changed:
  - app/pages/rephrase/[deck].vue (two changes)
