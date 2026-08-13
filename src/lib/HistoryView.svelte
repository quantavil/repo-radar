<script lang="ts">
  import { seenStore } from './seen.svelte';
  import ConfirmModal from './ConfirmModal.svelte';
  import RepoItem from './RepoItem.svelte';
  import type { TrendshiftRepo } from './types';
  import {
    ClockIcon,
    UndoIcon
  } from './icons';

  let searchQuery = $state('');
  let isConfirmOpen = $state(false);

  const seenKeys = $derived(seenStore.seenKeys);
  const seenDetailsMap = $derived(seenStore.seenDetails);

  const filteredSeenList = $derived.by(() => {
    const list: { key: string; repo: TrendshiftRepo }[] = seenKeys.map((key) => {
      const existing = seenDetailsMap.get(key);
      const repo: TrendshiftRepo = existing || seenStore.createStubRepo(key);
      return { key, repo };
    });

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();

    return list.filter(({ key, repo }) => {
      if (key.includes(q)) return true;
      if (repo) {
        const descMatch = repo.description?.toLowerCase().includes(q);
        const langMatch = repo.language?.toLowerCase().includes(q);
        return descMatch || langMatch;
      }
      return false;
    });
  });

  function handleClearAllConfirmed() {
    seenStore.resetSeen();
    searchQuery = '';
  }
</script>

<div class="space-y-5 flex flex-col flex-1">
  <!-- Controls Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-[var(--card-shadow)] shrink-0">
    <!-- Search Input -->
    <div class="flex-1 min-w-0">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search seen repositories by name, language, or topic..."
        class="w-full px-3 py-1.5 text-xs font-mono bg-[var(--bg-canvas)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded focus:outline-none focus:border-[var(--accent-signal)] placeholder-[var(--text-muted)] transition-colors"
        aria-label="Filter seen repositories"
      />
    </div>

    {#if seenKeys.length > 0}
      <div class="flex items-center gap-2 shrink-0 font-mono text-xs">
        <button
          onclick={() => (isConfirmOpen = true)}
          class="px-2.5 py-1 bg-[var(--badge-red-bg)] text-[var(--badge-red-text)] border border-[var(--badge-red-text)]/30 rounded text-xs hover:opacity-90 transition-all btn-press focus-visible:outline-none focus-visible:border-[var(--accent-signal)]"
        >
          Clear History
        </button>
      </div>
    {/if}
  </div>

  <div class="sr-only" role="status" aria-live="polite">
    Showing {filteredSeenList.length} of {seenKeys.length} seen repositories
  </div>

  <!-- Seen Repositories Grid -->
  {#if seenKeys.length === 0}
    <div class="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-3 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-8 w-full min-h-[300px] shadow-[var(--card-shadow)]">
      <div class="w-12 h-12 rounded-full bg-[var(--accent-signal-soft-bg)] border border-[var(--accent-signal)]/30 text-[var(--accent-signal-soft-text)] flex items-center justify-center mx-auto">
        <ClockIcon size={22} aria-hidden="true" />
      </div>
      <div class="space-y-1">
        <h3 class="font-bold text-base text-[var(--text-main)] tracking-tight font-display">
          No History
        </h3>
        <p class="text-xs text-[var(--text-muted)] leading-relaxed">
          Viewed or dismissed repositories are tracked here to prevent duplicates.
        </p>
      </div>
    </div>
  {:else if filteredSeenList.length === 0}
    <div class="py-12 text-center space-y-2 text-[var(--text-muted)] font-mono text-xs border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-6 w-full">
      <p>No seen repositories match "{searchQuery}".</p>
      <button
        onclick={() => (searchQuery = '')}
        class="text-[var(--text-main)] underline hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)] rounded px-1"
      >
        Clear Search
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {#each filteredSeenList as { key, repo } (key)}
        <RepoItem {repo}>
          {#snippet actions()}
            <button
              onclick={() => seenStore.unsee(key)}
              title="Restore to active feed"
              aria-label="Restore {repo.full_name} to active feed"
              class="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--accent-signal)] transition-colors btn-press shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)] min-w-[32px] min-h-[32px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            >
              <UndoIcon size={14} aria-hidden="true" />
            </button>
          {/snippet}
        </RepoItem>
      {/each}
    </div>
  {/if}
</div>

<!-- Clear History Confirmation Modal -->
<ConfirmModal
  isOpen={isConfirmOpen}
  title="Clear Seen History"
  message="Reset your seen history? RepoRadar will clear all {seenKeys.length} tracked repository keys, allowing them to appear in your feed stream again."
  confirmText="Clear History"
  confirmVariant="danger"
  onConfirm={handleClearAllConfirmed}
  onClose={() => (isConfirmOpen = false)}
/>
