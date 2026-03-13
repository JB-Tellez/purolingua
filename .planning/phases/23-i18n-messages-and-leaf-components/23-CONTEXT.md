# Phase 23: i18n Messages and Leaf Components - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Port all five leaf components (ChoiceButton, AudioButton, MicButton, FeedbackMessage, LevelFilterChips) as Vue SFCs, port SiteHeader with locale switcher and back/reset nav, and verify that the existing messages/it.json and messages/es.json load correctly in the @nuxtjs/i18n static output. No screen-level composition (ActivityPicker, DeckGrid, ScenarioGrid) in this phase — that is Phase 24.

</domain>

<decisions>
## Implementation Decisions

### Locale switcher behavior
- Clicking the language flag/toggle always navigates to the root of the other locale (`/es/` or `/it/`) — no current-path preservation
- Dropdown style: click the flag to open, shows both locale options with flags; closes on selection
- Currently active locale is highlighted with the `active` class inside the dropdown
- Use `<NuxtLinkLocale :locale="'es'">` (from @nuxtjs/i18n) for locale-switch links — not hardcoded paths

### SiteHeader back button
- Shows when path depth ≥ 2 segments (e.g., `/it/rephrase` shows the back button; `/it/` does not)
- Back button navigates to parent path: `useRoute().path.split('/').filter(Boolean).slice(0, -1).join('/')` prefixed with `/`
- Uses `<NuxtLink>` for back navigation

### SiteHeader reset
- Clicking Reset: clears `${lang}-progress` from localStorage, then calls `window.location.reload()`
- No confirmation dialog — immediate reset
- The `lang` value passed as a prop to SiteHeader; component reads it to construct the localStorage key

### Emit patterns — leaf components
- **LevelFilterChips**: `defineEmits(['update:activeLevels'])` — enables `v-model:activeLevels` on the parent. Parent in Phase 24: `<LevelFilterChips v-model:activeLevels="activeLevels" />`
- **ChoiceButton**: `defineEmits(['click', 'speak'])` — parent handles `@click` (grade answer) and `@speak` (TTS)
- **MicButton**: `defineEmits(['press'])` — parent handles `@press` to start voice recognition
- **FeedbackMessage**: no emits — display-only component, state passed as prop

### AudioButton SSR safety
- `import.meta.client` guard at the top of `speak()`: `if (!import.meta.client) return` — consistent with Phase 20/22 pattern
- Button renders on server (static HTML), speak() is never callable during SSR
- No `<ClientOnly>` wrapper required at call sites

### i18n access pattern
- All components use `const { t } = useI18n()` in `<script setup>` — explicit, TypeScript-friendly
- Full dotted key paths throughout: `t('study.correct')`, `t('nav.back')`, `t('filter.label')`, etc.
- No per-component namespace scoping (no `useScope: 'local'`)
- `$t()` template global NOT used — `t` from `useI18n()` only

### i18n message files
- `messages/it.json` and `messages/es.json` existing dotted-key structure is assumed compatible with @nuxtjs/i18n / vue-i18n v10
- `{count}` interpolation in `deckCardCount` is named interpolation — call site passes `{ count: n }` as second arg to `t()`
- Verify at build time: `nuxi generate` and confirm locale JSON loads without 404 and strings render correctly in static output

### Claude's Discretion
- Exact Tailwind classes and CSS class names for component markup (match existing patterns from the source components)
- Whether to use `@keydown` on ChoiceButton's speaker span in Vue (equivalent of the React `onKeyDown` for keyboard accessibility)
- Whether `SiteHeader` receives `lang` as a prop or reads it from `useI18n().locale` directly

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ChoiceButton.tsx`: Port target — span[role=button] speaker icon pattern stays (valid HTML, avoids nested buttons); `onClick`/`onSpeak` callbacks → `defineEmits(['click', 'speak'])`
- `src/components/AudioButton.tsx`: LANG_LOCALE map stays inline; `useTranslations('study')` → `useI18n().t('study.audio')`; `typeof window` guard → `import.meta.client`
- `src/components/MicButton.tsx`: Simplest component — no i18n, no browser API; `onPress` → `defineEmits(['press'])`
- `src/components/FeedbackMessage.tsx`: COLOR_CLASS map stays; `useTranslations('study')` → `useI18n().t('study.{state}')`
- `src/components/LevelFilterChips.tsx`: FLTR-06 guard lives in `useLevelFilter` composable (already done Phase 22); component just calls `emit('update:activeLevels', ...)` — no guard duplication needed
- `src/components/SiteHeader.tsx`: Most complex port — `useState(false)` → `ref(false)`; `usePathname` → `useRoute().path`; `useRouter` → `window.location.reload()`; `Link` → `NuxtLink`/`NuxtLinkLocale`

### Established Patterns
- `import.meta.client` for SSR guards (locked from Phase 20)
- `onMounted` for browser API access (composables already use this; AudioButton's speak() is click-triggered so no onMounted needed)
- `bun run test` / `bun run dev` for running the suite
- `app/composables/` for composables; components will live in `app/components/`

### Integration Points
- `app/components/` — Nuxt auto-imports all components; no explicit import statements needed in pages
- SiteHeader used in `app/app.vue` or a layout file — will need to accept `lang` prop or derive locale from `useI18n().locale.value`
- LevelFilterChips → wired to `useLevelFilter.activeLevels` in Phase 24 screen pages
- ChoiceButton, AudioButton, MicButton, FeedbackMessage → wired inside study session components in Phase 25
- `<NuxtLinkLocale>` from `#i18n/components` or @nuxtjs/i18n auto-import — verify auto-import availability

</code_context>

<specifics>
## Specific Ideas

- No specific UI references beyond matching the v1.3 Next.js visual output
- The LANG_LOCALE map (`it → it-IT`, `es → es-ES`) already exists in AudioButton and useVoiceRecognition — stay inline per the Phase 22 decision (single consumer, no shared file)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 23-i18n-messages-and-leaf-components*
*Context gathered: 2026-03-12*
