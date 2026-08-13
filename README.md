# RepoRadar

**RepoRadar** is an ultra-fast, zero-duplicate GitHub trending repository discovery web app. Built with an editorial utilitarian aesthetic, it streams trending repositories from the static CDN while ensuring you never see the same repository twice.

---

## Features

- **Zero-Duplicate Discovery**: LocalStorage FIFO history tracking guarantees 100% unique repository discovery across sessions.
- **Scroll-Past Auto-Seen**: Cards are automatically marked as seen when scrolled past (`bottom < 56px`).
- **Gmail-Style Mobile Touch Gestures**:
  - **Swipe Right** (> 120px): Bookmark / Save repository.
  - **Swipe Left** (> 120px): Toggle Seen / Unseen status.
  - Native touch pan support (`touch-action: pan-y`) for smooth mobile vertical scrolling.
- **Inline Language Filtering**: Real-time language filter dropdown with keyboard navigation and `aria-activedescendant` support.
- **Saved Bookmarks View**: Full bookmarks view with search filter, sort (highest growth, most stars, repo name), blob JSON export, and clear all action.
- **Seen History Inspector**: View past seen items, restore individual repositories to the feed stream, or clear history.
- **Settings & Preferences**: Dark/light mode theme toggle, auto-seen on scroll toggle, mobile swipe gestures toggle, and shortcut cheat-sheet.
- **Full Keyboard & Screen Reader Accessibility**: WCAG AA compliant contrast, focus trap modals, visible focus rings, and `@tanstack/hotkeys`.

---

## Keyboard Shortcuts

| Shortcut | Action |
|:---:|---|
| <kbd>1</kbd> | Switch to Feed View (Home) |
| <kbd>2</kbd> | Switch to Saved Bookmarks View |
| <kbd>3</kbd> | Switch to Seen History View |
| <kbd>4</kbd> | Switch to Settings & Shortcuts View |
| <kbd>?</kbd> | Open Shortcuts & Settings |
| <kbd>J</kbd> | Focus next repository card |
| <kbd>K</kbd> | Focus previous repository card |
| <kbd>S</kbd> | Save / Bookmark active repository |
| <kbd>D</kbd> | Toggle Seen status for active repository |
| <kbd>Esc</kbd> | Close active modal or return to feed stream |

---

## Technology Stack

- **Framework**: [Svelte 5](https://svelte.dev/) with Svelte 5 Runes (`$state`, `$derived`, `$props`, `$effect`)
- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Geist Typography
- **Utilities**: [@tanstack/hotkeys](https://tanstack.com/) & [@tanstack/pacer](https://tanstack.com/)

---

## Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. Start Development Server
```bash
bun run dev
```

### 3. Run Static Type & Accessibility Diagnostics
```bash
bun run check
```

### 4. Build for Production
```bash
bun run build
```

---

## License

[MIT License](LICENSE) © 2026 quantavil
