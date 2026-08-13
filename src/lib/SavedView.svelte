<script lang="ts">
  import { seenStore } from './seen.svelte';
  import ConfirmModal from './ConfirmModal.svelte';
  import RepoItem from './RepoItem.svelte';
  import {
    BookmarkIcon,
    TrashIcon
  } from './icons';

  let searchQuery = $state('');
  let sortBy = $state<'newest' | 'stars' | 'growth' | 'name'>('growth');
  let isConfirmOpen = $state(false);

  const savedList = $derived(Array.from(seenStore.saved.values()));

  const filteredAndSortedList = $derived.by(() => {
    const list = savedList.filter((repo) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const fullNameMatch = repo.full_name?.toLowerCase().includes(q);
      const descMatch = repo.description?.toLowerCase().includes(q);
      const langMatch = repo.language?.toLowerCase().includes(q);
      const tagsMatch = repo.tags?.some((tag) => tag.toLowerCase().includes(q));
      return fullNameMatch || descMatch || langMatch || tagsMatch;
    });

    return list.sort((a, b) => {
      if (sortBy === 'stars') return (b.stars_total ?? 0) - (a.stars_total ?? 0);
      if (sortBy === 'growth') return (b.stars_gained ?? 0) - (a.stars_gained ?? 0);
      if (sortBy === 'name') return (a.full_name ?? '').localeCompare(b.full_name ?? '');
      return 0; // Default order
    });
  });

  function handleClearAllConfirmed() {
    seenStore.saved = new Map();
    seenStore.saveSaved();
    searchQuery = '';
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(savedList, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `reporadar-saved-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  }
</script>

<div class="space-y-5">
  <!-- Controls Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-[var(--card-shadow)]">
    <!-- Search Input -->
    <div class="flex-1 min-w-0">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Filter saved repos by name, language, or tag..."
        class="w-full px-3 py-1.5 text-xs font-mono bg-[var(--bg-canvas)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] placeholder-[var(--text-muted)] transition-colors"
        aria-label="Filter saved repositories"
      />
    </div>

    <!-- Actions: Sort Dropdown & Export -->
    <div class="flex items-center gap-2 shrink-0 font-mono text-xs">
      <label class="flex items-center gap-1.5 text-[var(--text-muted)]">
        <span>Sort:</span>
        <select
          bind:value={sortBy}
          class="px-2 py-1 bg-[var(--bg-canvas)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-signal)] font-mono text-xs cursor-pointer"
        >
          <option value="growth">Highest Growth (+stars)</option>
          <option value="stars">Most Total Stars</option>
          <option value="name">Repository Name</option>
        </select>
      </label>

      {#if savedList.length > 0}
        <button
          onclick={exportJSON}
          title="Export Bookmarks as JSON"
          class="px-2.5 py-1 bg-[var(--bg-canvas)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded text-xs hover:border-[var(--border-strong)] transition-all btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)]"
        >
          Export JSON
        </button>
        <button
          onclick={() => (isConfirmOpen = true)}
          class="px-2.5 py-1 bg-[var(--badge-red-bg)] text-[var(--badge-red-text)] border border-[var(--badge-red-text)]/30 rounded text-xs hover:opacity-90 transition-all btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)]"
        >
          Clear All
        </button>
      {/if}
    </div>
  </div>

  <div class="sr-only" role="status" aria-live="polite">
    Showing {filteredAndSortedList.length} of {savedList.length} saved repositories
  </div>

  <!-- Saved Items Grid -->
  {#if savedList.length === 0}
    <div class="py-20 text-center space-y-4 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-8 max-w-md mx-auto shadow-[var(--card-shadow)]">
      <div class="w-12 h-12 rounded-full bg-[var(--accent-signal-soft-bg)] border border-[var(--accent-signal)]/30 text-[var(--accent-signal-soft-text)] flex items-center justify-center mx-auto">
        <BookmarkIcon size={22} aria-hidden="true" />
      </div>
      <div class="space-y-1">
        <h3 class="font-bold text-base text-[var(--text-main)] tracking-tight font-display">
          No Saved Repositories
        </h3>
        <p class="text-xs text-[var(--text-muted)] leading-relaxed">
          Press <kbd class="mx-0.5">S</kbd> on any card in the feed stream or swipe right on mobile to bookmark repositories.
        </p>
      </div>
    </div>
  {:else if filteredAndSortedList.length === 0}
    <div class="py-12 text-center space-y-2 text-[var(--text-muted)] font-mono text-xs border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-6">
      <p>No saved repositories match "{searchQuery}".</p>
      <button
        onclick={() => (searchQuery = '')}
        class="text-[var(--text-main)] underline hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)] rounded px-1"
      >
        Clear Search
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {#each filteredAndSortedList as repo (repo.full_name)}
        <RepoItem {repo}>
          {#snippet actions()}
            <button
              onclick={() => seenStore.removeSaved(repo.full_name)}
              title="Remove from saved"
              aria-label="Remove {repo.full_name} from saved"
              class="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--badge-red-text)] transition-colors btn-press shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)] min-w-[32px] min-h-[32px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            >
              <TrashIcon size={14} aria-hidden="true" />
            </button>
          {/snippet}
        </RepoItem>
      {/each}
    </div>
  {/if}
</div>

<!-- Clear All Confirmation Modal -->
<ConfirmModal
  isOpen={isConfirmOpen}
  title="Clear All Saved Repositories"
  message="Are you sure you want to remove all {savedList.length} bookmarked repositories? This action cannot be undone."
  confirmText="Clear All"
  confirmVariant="danger"
  onConfirm={handleClearAllConfirmed}
  onClose={() => (isConfirmOpen = false)}
/>
