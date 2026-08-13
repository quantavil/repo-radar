import { createMultiHotkeyHandler } from '@tanstack/hotkeys';

export interface HotkeyActions {
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
  onDismiss: () => void;
  onReset: () => void;
  onViewFeed?: () => void;
  onViewSaved?: () => void;
  onViewHistory?: () => void;
  onViewSettings?: () => void;
  onEscape?: () => void;
}

export function setupHotkeys(actions: HotkeyActions) {
  const handlerMap: Record<string, (e: KeyboardEvent) => void> = {
    j: () => actions.onNext(),
    k: () => actions.onPrev(),
    s: () => actions.onSave(),
    d: () => actions.onDismiss(),
    r: () => actions.onReset(),
    '1': () => actions.onViewFeed?.(),
    '2': () => actions.onViewSaved?.(),
    '3': () => actions.onViewHistory?.(),
    '4': () => actions.onViewSettings?.(),
    '?': () => actions.onViewSettings?.(),
    escape: () => actions.onEscape?.(),
  };

  const handler = createMultiHotkeyHandler(handlerMap, {
    preventDefault: true,
    stopPropagation: true,
  });

  const listener = (e: KeyboardEvent) => {
    // Check if any modal dialog or dropdown menu is currently open in the DOM
    const isModalOpen = typeof document !== 'undefined' && (
      !!document.querySelector('[role="dialog"]') ||
      !!document.querySelector('[aria-modal="true"]') ||
      !!document.querySelector('[role="listbox"]')
    );

    if (isModalOpen) {
      if (e.key === 'Escape') {
        actions.onEscape?.();
      }
      return;
    }

    const target = e.target as HTMLElement | null;
    const isInput = target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      !!target.closest('[contenteditable="true"]') ||
      ['textbox', 'combobox', 'searchbox'].includes(target.getAttribute('role') || '')
    );

    if (isInput) {
      if (e.key === 'Escape') {
        target.blur();
      }
      return;
    }

    handler(e);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', listener);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', listener);
    }
  };
}
