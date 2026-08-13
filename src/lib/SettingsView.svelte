<script lang="ts">
  import { seenStore } from './seen.svelte';
  import ToggleSwitch from './ToggleSwitch.svelte';
  import { SettingsIcon, SunIcon, MoonIcon, KeyboardIcon } from './icons';

  let { isDark = $bindable(true) } = $props<{
    isDark?: boolean;
  }>();

  const shortcuts = [
    { key: '1', action: 'Switch to Feed View (Home)' },
    { key: '2', action: 'Switch to Bookmarks View' },
    { key: '3', action: 'Switch to History View' },
    { key: '4', action: 'Switch to Settings View' },
    { key: '?', action: 'Open Shortcuts & Settings' },
    { key: 'J', action: 'Move focus to next repository card' },
    { key: 'K', action: 'Move focus to previous repository card' },
    { key: 'S', action: 'Save / Bookmark active repository' },
    { key: 'D', action: 'Toggle Seen status for active repository' },
    { key: 'Esc', action: 'Return to Feed stream' }
  ];
</script>

{#snippet sunIconSnippet()}
  <SunIcon size={13} aria-hidden="true" />
{/snippet}

{#snippet moonIconSnippet()}
  <MoonIcon size={13} aria-hidden="true" />
{/snippet}

<div class="space-y-6 w-full">
  <!-- Preferences Card -->
  <div class="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-[var(--card-shadow)] p-5 sm:p-6 space-y-5">
    <div class="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
      <SettingsIcon size={18} class="text-[var(--accent-signal)]" aria-hidden="true" />
      <h2 class="font-bold text-base text-[var(--text-main)] font-display tracking-tight">
        Application Preferences
      </h2>
    </div>

    <div class="space-y-4">
      <!-- 1. Theme Preference -->
      <ToggleSwitch
        checked={isDark}
        onChange={(val) => (isDark = val)}
        label="Appearance Theme"
        description="Select your preferred color theme (Dark / Light)"
        iconInactive={sunIconSnippet}
        iconActive={moonIconSnippet}
        ariaLabel="Dark mode appearance theme"
      />

      <div class="border-t border-[var(--border-subtle)] pt-2">
        <!-- 2. Scroll-Past Auto-Seen -->
        <ToggleSwitch
          checked={seenStore.autoSeenOnScroll}
          onChange={(val) => (seenStore.autoSeenOnScroll = val)}
          label="Scroll-Past Auto-Seen"
          description="Automatically mark repositories as seen when scrolled past"
          ariaLabel="Toggle Scroll-Past Auto-Seen"
        />
      </div>

      <div class="border-t border-[var(--border-subtle)] pt-2">
        <!-- 3. Mobile Touch Swipe Gestures -->
        <ToggleSwitch
          checked={seenStore.swipeGesturesEnabled}
          onChange={(val) => (seenStore.swipeGesturesEnabled = val)}
          label="Mobile Touch Swipe Gestures"
          description="Enable swipe right (bookmark) & swipe left (seen) on mobile devices"
          ariaLabel="Toggle Mobile Touch Swipe Gestures"
        />
      </div>
    </div>
  </div>

  <!-- Keyboard Shortcuts Cheat-sheet Card -->
  <div class="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-[var(--card-shadow)] p-5 sm:p-6 space-y-4">
    <div class="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
      <KeyboardIcon size={18} class="text-[var(--accent-signal)]" aria-hidden="true" />
      <h2 class="font-bold text-base text-[var(--text-main)] font-display tracking-tight">
        Keyboard Shortcuts Reference
      </h2>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      {#each shortcuts as item}
        <div class="flex items-center justify-between text-xs p-2.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
          <span class="text-[var(--text-muted)] font-mono">{item.action}</span>
          <kbd class="ml-2 font-mono font-bold shrink-0 px-2 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-[var(--text-main)] shadow-xs">{item.key}</kbd>
        </div>
      {/each}
    </div>
  </div>
</div>
