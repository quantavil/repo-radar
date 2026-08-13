import { Debouncer } from '@tanstack/pacer';
import type { TrendshiftRepo } from './types';

const MAX_SEEN_ITEMS = 2000;


export class SeenStore {
  seenDetails = $state<Map<string, TrendshiftRepo>>(new Map());
  saved = $state<Map<string, TrendshiftRepo>>(new Map());

  private _autoSeenOnScroll = $state(true);
  private _swipeGesturesEnabled = $state(true);

  get autoSeenOnScroll(): boolean {
    return this._autoSeenOnScroll;
  }

  set autoSeenOnScroll(value: boolean) {
    this._autoSeenOnScroll = value;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('auto_seen_on_scroll', JSON.stringify(value));
      } catch (err) {
        console.error('Failed to save auto_seen_on_scroll:', err);
      }
    }
  }

  get swipeGesturesEnabled(): boolean {
    return this._swipeGesturesEnabled;
  }

  set swipeGesturesEnabled(value: boolean) {
    this._swipeGesturesEnabled = value;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('swipe_gestures_enabled', JSON.stringify(value));
      } catch (err) {
        console.error('Failed to save swipe_gestures_enabled:', err);
      }
    }
  }

  get seenKeys(): string[] {
    return Array.from(this.seenDetails.keys());
  }

  get seenSize(): number {
    return this.seenDetails.size;
  }

  private debouncer: Debouncer<() => void>;

  constructor() {
    this.debouncer = new Debouncer(
      () => this.saveSeenSync(),
      { wait: 300 }
    );

    this.loadFromStorage();

    if (typeof window !== 'undefined') {
      const flushSave = () => this.debouncer.flush();
      window.addEventListener('beforeunload', flushSave);
      window.addEventListener('pagehide', flushSave);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushSave();
      });
    }
  }

  private normalizeKey(key: string): string {
    return (key || '').trim().toLowerCase();
  }

  createStubRepo(fullName: string): TrendshiftRepo {
    const parts = fullName.split('/');
    return {
      rank: 0,
      score: 0,
      full_name: fullName,
      github_url: `https://github.com/${fullName}`,
      description: '',
      language: '',
      stars_total: 0,
      stars_gained: 0,
      forks_total: 0,
      forks_gained: 0,
      created_at: '',
      tags: [],
      social_mention_platforms: []
    };
  }

  private saveSeenSync() {
    if (typeof window === 'undefined') return;
    try {
      const entries = Array.from(this.seenDetails.entries());
      localStorage.setItem('seen_details', JSON.stringify(entries));
      localStorage.setItem('seen_repos', JSON.stringify(Array.from(this.seenDetails.keys())));
    } catch (err) {
      console.error('Failed to save seen_details to localStorage:', err);
      // QuotaExceededError safety: prune oldest 20% if quota hit
      if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
        try {
          const keys = Array.from(this.seenDetails.keys());
          const toRemove = keys.slice(0, Math.floor(keys.length * 0.2));
          const nextDetails = new Map(this.seenDetails);
          for (const k of toRemove) {
            nextDetails.delete(k);
          }
          this.seenDetails = nextDetails;
          localStorage.setItem('seen_details', JSON.stringify(Array.from(this.seenDetails.entries())));
          localStorage.setItem('seen_repos', JSON.stringify(Array.from(this.seenDetails.keys())));
        } catch (retryErr) {
          console.error('Failed to save after pruning:', retryErr);
        }
      }
    }
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const rawSeenDetails = localStorage.getItem('seen_details');
      const detailsMap = new Map<string, TrendshiftRepo>();

      if (rawSeenDetails) {
        const parsed = JSON.parse(rawSeenDetails);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (Array.isArray(item) && item.length >= 2 && item[0] && item[1]) {
              const [k, v] = item;
              detailsMap.set(this.normalizeKey(k), v);
            }
          }
        }
      }

      // Backward compatibility fallback if seen_repos exists but seen_details was empty
      if (detailsMap.size === 0) {
        const rawSeen = localStorage.getItem('seen_repos');
        if (rawSeen) {
          const parsed = JSON.parse(rawSeen);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (typeof item === 'string' && item.trim()) {
                const norm = this.normalizeKey(item);
                detailsMap.set(norm, this.createStubRepo(item));
              }
            }
          }
        }
      }

      this.seenDetails = detailsMap;

      const rawSaved = localStorage.getItem('saved_repos');
      if (rawSaved) {
        const parsed = JSON.parse(rawSaved);
        if (Array.isArray(parsed)) {
          const savedMap = new Map<string, TrendshiftRepo>();
          for (const item of parsed) {
            if (Array.isArray(item) && item.length >= 2 && item[0] && item[1]) {
              const [k, v] = item;
              savedMap.set(this.normalizeKey(k), v);
            }
          }
          this.saved = savedMap;
        }
      }

      const rawAutoSeen = localStorage.getItem('auto_seen_on_scroll');
      if (rawAutoSeen !== null) {
        this._autoSeenOnScroll = JSON.parse(rawAutoSeen);
      }

      const rawSwipe = localStorage.getItem('swipe_gestures_enabled');
      if (rawSwipe !== null) {
        this._swipeGesturesEnabled = JSON.parse(rawSwipe);
      }
    } catch (err) {
      console.error('Failed to parse storage:', err);
    }
  }

  isSeen(fullName: string): boolean {
    return this.seenDetails.has(this.normalizeKey(fullName));
  }

  setSeenDetailsBatch(items: Array<{ fullName: string; repo: TrendshiftRepo }>) {
    if (items.length === 0) return;
    let changed = false;
    const nextDetails = new Map(this.seenDetails);

    for (const { fullName, repo } of items) {
      const key = this.normalizeKey(fullName);
      if (!nextDetails.has(key)) {
        nextDetails.set(key, repo);
        changed = true;
      }
    }

    if (changed) {
      this.seenDetails = nextDetails;
      this.debouncer.maybeExecute();
    }
  }

  markSeen(repoOrName: string | TrendshiftRepo) {
    const isObj = typeof repoOrName !== 'string';
    const fullName = isObj ? repoOrName.full_name : repoOrName;
    const key = this.normalizeKey(fullName);
    const repoObj: TrendshiftRepo = isObj ? repoOrName : (this.seenDetails.get(key) || this.createStubRepo(fullName));

    const nextDetails = new Map(this.seenDetails);

    // Delete first if exists to reset FIFO insertion position to end of Map
    if (nextDetails.has(key)) {
      nextDetails.delete(key);
    } else if (nextDetails.size >= MAX_SEEN_ITEMS) {
      const firstKey = nextDetails.keys().next().value;
      if (firstKey) {
        nextDetails.delete(firstKey);
      }
    }

    nextDetails.set(key, repoObj);
    this.seenDetails = nextDetails;
    this.debouncer.maybeExecute();
  }

  toggleSeen(repoOrName: string | TrendshiftRepo) {
    const isObj = typeof repoOrName !== 'string';
    const fullName = isObj ? repoOrName.full_name : repoOrName;
    const key = this.normalizeKey(fullName);

    const nextDetails = new Map(this.seenDetails);

    if (nextDetails.has(key)) {
      nextDetails.delete(key);
    } else {
      if (nextDetails.size >= MAX_SEEN_ITEMS) {
        const firstKey = nextDetails.keys().next().value;
        if (firstKey) {
          nextDetails.delete(firstKey);
        }
      }
      const repoObj: TrendshiftRepo = isObj ? repoOrName : (this.seenDetails.get(key) || this.createStubRepo(fullName));
      nextDetails.set(key, repoObj);
    }

    this.seenDetails = nextDetails;
    this.debouncer.maybeExecute();
  }

  unsee(fullName: string) {
    const key = this.normalizeKey(fullName);
    if (this.seenDetails.has(key)) {
      const nextDetails = new Map(this.seenDetails);
      nextDetails.delete(key);
      this.seenDetails = nextDetails;
      this.debouncer.maybeExecute();
    }
  }

  resetSeen() {
    this.debouncer.cancel();
    this.seenDetails = new Map();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('seen_repos');
        localStorage.removeItem('seen_details');
      } catch (err) {
        console.error('Failed to clear seen_repos:', err);
      }
    }
  }

  isSaved(fullName: string): boolean {
    return this.saved.has(this.normalizeKey(fullName));
  }

  toggleSave(repo: TrendshiftRepo) {
    const key = this.normalizeKey(repo.full_name);
    const nextSaved = new Map(this.saved);
    if (nextSaved.has(key)) {
      nextSaved.delete(key);
    } else {
      nextSaved.set(key, repo);
    }
    this.saved = nextSaved;
    this.saveSaved();
  }

  removeSaved(fullName: string) {
    const key = this.normalizeKey(fullName);
    if (this.saved.has(key)) {
      const nextSaved = new Map(this.saved);
      nextSaved.delete(key);
      this.saved = nextSaved;
      this.saveSaved();
    }
  }

  saveSaved() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('saved_repos', JSON.stringify(Array.from(this.saved.entries())));
    } catch (err) {
      console.error('Failed to save saved_repos to localStorage:', err);
    }
  }

  exportHistoryJSON(): string {
    const entries = Array.from(this.seenDetails.entries());
    return JSON.stringify(entries, null, 2);
  }

  importHistoryJSON(jsonStr: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      const newMap = new Map<string, TrendshiftRepo>();

      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (Array.isArray(item) && item.length >= 2 && item[0] && item[1]) {
            const [k, v] = item;
            newMap.set(this.normalizeKey(k), v);
          } else if (typeof item === 'string' && item.trim()) {
            const norm = this.normalizeKey(item);
            newMap.set(norm, this.createStubRepo(item));
          } else if (item && typeof item === 'object' && item.full_name) {
            const norm = this.normalizeKey(item.full_name);
            newMap.set(norm, item);
          }
        }
      } else {
        return { success: false, count: 0, error: 'Invalid JSON format. Expected an array of history entries.' };
      }

      this.debouncer.cancel();
      this.seenDetails = newMap;
      this.saveSeenSync();
      return { success: true, count: newMap.size };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || 'Failed to parse JSON file' };
    }
  }
}

export const seenStore = new SeenStore();
