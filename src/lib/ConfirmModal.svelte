<script lang="ts">
  import { CloseIcon } from './icons';

  let {
    isOpen = false,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    confirmVariant = 'danger',
    onConfirm,
    onClose
  } = $props<{
    isOpen: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    confirmVariant?: 'danger' | 'primary';
    onConfirm: () => void;
    onClose: () => void;
  }>();

  let dialogRef = $state<HTMLDivElement | null>(null);
  let cancelBtnRef = $state<HTMLButtonElement | null>(null);
  let previousActiveElement: HTMLElement | null = null;

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'Tab' && dialogRef) {
      const focusables = dialogRef.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  $effect(() => {
    if (typeof document !== 'undefined' && isOpen) {
      previousActiveElement = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        cancelBtnRef?.focus();
      }, 30);

      return () => {
        document.body.style.overflow = '';
        if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
          previousActiveElement.focus();
        }
      };
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <!-- Backdrop (Heavy Frosted Glass Blur) -->
  <div
    onclick={onClose}
    aria-hidden="true"
    class="fixed inset-0 z-40 bg-black/60 backdrop-blur-xl transition-opacity duration-300"
  ></div>

  <!-- Modal Container -->
  <div
    bind:this={dialogRef}
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-modal-title"
    aria-describedby="confirm-modal-description"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <div class="popover-animate w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-xl p-5 space-y-4 font-sans">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <h3 id="confirm-modal-title" class="font-semibold text-sm text-[var(--text-main)] font-display tracking-tight">
          {title}
        </h3>
        <button
          onclick={onClose}
          class="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-canvas)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)]"
          aria-label="Close modal"
        >
          <CloseIcon size={15} aria-hidden="true" />
        </button>
      </div>

      <!-- Content -->
      <p id="confirm-modal-description" class="text-xs text-[var(--text-muted)] leading-relaxed">
        {message}
      </p>

      <!-- Actions -->
      <div class="pt-2 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] font-mono text-xs">
        <button
          bind:this={cancelBtnRef}
          onclick={onClose}
          class="px-3.5 py-1.5 bg-[var(--bg-canvas)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-md font-medium hover:border-[var(--border-strong)] transition-colors btn-press active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)]"
        >
          Cancel
        </button>
        <button
          onclick={() => {
            onConfirm();
            onClose();
          }}
          class="px-3.5 py-1.5 rounded-md font-semibold transition-all btn-press active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-signal)] {
            confirmVariant === 'danger'
              ? 'bg-[var(--badge-red-bg)] text-[var(--badge-red-text)] border border-[var(--badge-red-text)]/30 hover:opacity-90'
              : 'bg-[var(--accent-signal)] text-white dark:text-zinc-950 hover:opacity-90'
          }"
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}
