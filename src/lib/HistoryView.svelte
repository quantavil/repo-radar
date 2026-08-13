<script lang="ts">
  import { seenStore } from './seen.svelte';
  import ConfirmModal from './ConfirmModal.svelte';
  import RepoItem from './RepoItem.svelte';
  import type { TrendshiftRepo } from './types';
  import {
    ClockIcon,
    UndoIcon,
    TrashIcon
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

<div class="space-y-4 pb-24 relative">
  <!-- Search Filter Input Strip -->
  <div class="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-[var(--card-shadow)]">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search seen repositories by name, language, or topic..."
      class="w-full px-3 py-1.5 text-xs font-mono bg-[var(--bg-canvas)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] placeholder-[var(--text-muted)] transition-colors"
      aria-label="Filter seen repositories"
    />
  </div>

  <div class="sr-only" role="status" aria-live="polite">
    Showing {filteredSeenList.length} of {seenKeys.length} seen repositories
  </div>

  <!-- Seen Repositories List -->
  {#if seenKeys.length === 0}
    <div class="py-20 text-center space-y-4 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-8 max-w-md mx-auto shadow-[var(--card-shadow)] my-8">
      <div class="w-12 h-12 rounded-full bg-[var(--accent-signal-soft-bg)] border border-[var(--accent-signal)]/30 text-[var(--accent-signal-soft-text)] flex items-center justify-center mx-auto">
        <ClockIcon size={22} aria-hidden="true" />
      </div>
      <div class="space-y-1">
        <h3 class="font-bold text-base text-[var(--text-main)] tracking-tight font-display">
          Seen History is Empty
        </h3>
        <p class="text-xs text-[var(--text-muted)] leading-relaxed">
          Repositories you view or dismiss in the feed stream will be tracked here so you never see duplicates.
        </p>
      </div>
    </div>
  {:else if filteredSeenList.length === 0}
    <div class="py-12 text-center space-y-2 text-[var(--text-muted)] font-mono text-xs border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-6 my-4">
      <p>No seen repositories match "{searchQuery}".</p>
      <button
        onclick={() => (searchQuery = '')}
        class="text-[var(--text-main)] underline hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)] rounded px-1"
      >
        Clear Search
      </button>
    </div>
  {:else}
    <div class="space-y-3">
      {#each filteredSeenList as { key, repo } (key)}
        <RepoItem {repo} isSeen={true}>
          {#snippet actions()}
            <button
              onclick={() => seenStore.unsee(key)}
              title="Restore repository to active feed stream"
              aria-label="Restore {repo.full_name} to active feed stream"
              class="inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-xs font-medium rounded-md border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:bg-[var(--accent-signal-soft-bg)] hover:text-[var(--accent-signal-soft-text)] hover:border-[var(--accent-signal)]/40 transition-all btn-press active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)]"
            >
              <UndoIcon size={12} class="shrink-0" aria-hidden="true" />
              <span>Restore</span>
            </button>
          {/snippet}
        </RepoItem>
      {/each}
    </div>
  {/if}

  <!-- Floating Bottom Action Bar for Clear History -->
  {#if seenKeys.length > 0}
    <div class="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40">
      <button
        onclick={() => (isConfirmOpen = true)}
        class="px-4 py-2 bg-[var(--badge-red-bg)] text-[var(--badge-red-text)] border border-[var(--badge-red-text)]/30 rounded-full text-xs font-mono font-medium hover:opacity-95 transition-all btn-press active:scale-95 shadow-xl flex items-center gap-1.5 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)]"
      >
        <TrashIcon size={13} aria-hidden="true" />
        <span>Clear History</span>
      </button>
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
