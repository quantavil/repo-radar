# Project Agent (AGENT.md)

## Project Overview
- **Name**: RepoRadar — Zero-duplicate GitHub trending repository discovery web app.
- **Tech Stack**: Svelte 5 Runes, Bun, Vite 8, Tailwind CSS v4, `@tanstack/hotkeys`, `@tanstack/pacer`.
- **Data Source**: Trendshift Static CDN API (`https://quantavil.github.io/trendshift/data/`).

---

## Key Architecture & Components
- `src/lib/seen.svelte.ts`: `SeenStore` rune class managing localStorage persistence for `seenDetails` Map (2000-item FIFO quota) and saved Map, with `@tanstack/pacer` debouncer and visibility change listeners.
- `src/lib/api.svelte.ts`: CDN fetcher with multi-timeframe fallback chain (`daily` ➔ `weekly` ➔ `monthly`), intra-session deduplication, and batched `seenDetails` updates.
- `src/lib/RepoItem.svelte`: Shared canonical card component with clean single-border utilitarian styling, eliminating duplicate markup across Feed, Saved, and History views.
- `src/lib/RepoCard.svelte`: Accessible feed card wrapper with connected DOM scroll-past auto-seen observer (`bottom < 56px`), mobile touch swipe gestures (`touch-action: pan-y`), and keyboard focus indicators.
- `src/lib/ToggleSwitch.svelte`: Reusable toggle switch component.
- `src/lib/SavedView.svelte`: Saved bookmarks view with search filter, uniform 2-column grid, direct array sort, blob JSON export, and clear all confirmation modal.
- `src/lib/HistoryView.svelte`: Seen history view with search filter, restore action, and clear history floating action bar.
- `src/lib/SettingsView.svelte`: Appearance theme toggle, auto-seen toggle, touch swipe toggle, and keyboard shortcuts reference.
- `src/lib/ConfirmModal.svelte`: Accessible modal dialog with focus trap, focus restoration, and ESC support.
- `src/lib/LanguageSelect.svelte`: Custom combobox dropdown with `aria-activedescendant` and full keyboard navigation.
- `src/lib/Navbar.svelte`: Sticky top edge-to-edge navigation header with brand logo and view icon buttons.
- `src/lib/hotkeys.ts`: `@tanstack/hotkeys` keyboard shortcut bindings (<kbd>1</kbd>-<kbd>4</kbd>, <kbd>J</kbd>, <kbd>K</kbd>, <kbd>S</kbd>, <kbd>D</kbd>, <kbd>?</kbd>, <kbd>Esc</kbd>) with modal open detection.

---

## Blunders Log
- **Svelte 5 Set/Map Reactivity**: Mutating Svelte 5 `$state(new Set())` or `$state(new Map())` in-place does NOT notify `$derived` listeners. Reference must be reassigned (`this.seenDetails = new Map(this.seenDetails)`).
- **Storage Key Normalization & Metadata**: `markSeen` with string keys omitted `seenDetails` entries, causing empty history metadata. Fixed by storing full `TrendshiftRepo` objects and normalizing keys on storage load.
- **Mobile Touch Gesture Collision**: Swiping cards horizontally without `style="touch-action: pan-y"` collided with browser vertical scrolling. Fixed by applying `touch-action: pan-y` and `e.preventDefault()` during active horizontal swipe.
- **Explicit Dismiss State Flip**: `handleExplicitDismiss` called `toggleSeen` instead of `markSeen`, un-marking previously seen repos when dismissed. Fixed by explicitly calling `markSeen(repo)`.
- **Swipe Overlay Text Contrast**: Light mode swipe action text on green/red background had 1.4:1 contrast (`text-zinc-950`). Fixed by setting `text-white dark:text-zinc-950`.
- **Unmounted Card Auto-Seen Trigger**: `IntersectionObserver` callback in `RepoCard.svelte` triggered on card unmount when switching views. Fixed by checking `entry.target.isConnected`.
- **Malformed Storage Parse Crash**: `JSON.parse` of `localStorage` threw `TypeError` on non-tuple array items. Fixed by checking `Array.isArray(item) && item.length >= 2`.
- **Hotkey Leak Behind Open Modals**: Global hotkeys (<kbd>1</kbd>–<kbd>4</kbd>, <kbd>S</kbd>, <kbd>D</kbd>) remained active while modal dialogs were open. Fixed by checking for active modal dialogs in global listener.
- **Unfocused Hotkey Target Defaulting**: Pressing <kbd>S</kbd> or <kbd>D</kbd> without explicit card focus (`focusedIndex === -1`) defaulted to `repos[0]`. Fixed with explicit `focusedIndex < 0` guard.
- **Combobox ARIA Role**: `aria-activedescendant` on `<button>` without `role="combobox"` triggered Svelte 5 a11y compiler warnings. Fixed by adding `role="combobox"`.
- **Listbox Hotkey Leak**: Global hotkeys triggered when custom combobox listboxes were open. Fixed by adding `[role="listbox"]` to modal detector in `hotkeys.ts`.
- **Feed Truncation at 10 Unseen Repos**: `api.svelte.ts` broke the timeframe loop as soon as `collected.length >= 10`, cutting off the feed prematurely. Fixed by removing the artificial break to sweep all available unseen repos across `daily`, `weekly`, and `monthly` timeframes.

---

## File Structure & Map
- `src/lib/icons/`: Reusable SVG icon components.
- `src/app.css`: Tailwind v4 base styles, Geist typography, physical `<kbd>` styling, micro-animations, minimal scrollbars.
