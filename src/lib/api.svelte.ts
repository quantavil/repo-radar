import type { TrendshiftRepo, LanguageOption } from './types';
import { seenStore } from './seen.svelte';

const BASE_CDN = 'https://quantavil.github.io/trendshift/data';

export class RepoFeed {
  repos = $state<TrendshiftRepo[]>([]);
  loading = $state<boolean>(false);
  error = $state<string | null>(null);
  selectedLanguage = $state<LanguageOption>('all');
  activeTimeframe = $state<string>('daily');
  private _fetchId = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('repo_radar_lang') as LanguageOption | null;
      if (savedLang) {
        this.selectedLanguage = savedLang;
      }
    }
  }

  async setLanguage(lang: LanguageOption) {
    this.selectedLanguage = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('repo_radar_lang', lang);
    }
    await this.fetchFeed();
  }

  async fetchFeed() {
    this.loading = true;
    this.error = null;
    this.repos = [];
    const fetchId = ++this._fetchId;

    const timeframes: ('daily' | 'weekly' | 'monthly')[] = ['daily', 'weekly', 'monthly'];
    const collected: TrendshiftRepo[] = [];
    const localSeenInSession = new Set<string>();
    const seenDetailsToBatch: Array<{ fullName: string; repo: TrendshiftRepo }> = [];

    let networkSuccessCount = 0;
    let primaryTimeframeSet = false;

    for (const tf of timeframes) {
      try {
        const langSlug = this.selectedLanguage;
        const endpoint = `${BASE_CDN}/${tf}/${tf}-${langSlug}.json`;
        
        const res = await fetch(endpoint);
        if (fetchId !== this._fetchId) return;

        if (!res.ok) {
          continue;
        }

        networkSuccessCount++;
        const rawData: TrendshiftRepo[] = await res.json();
        if (fetchId !== this._fetchId) return;
        
        let addedInThisTimeframe = 0;
        
        for (const item of rawData) {
          if (!item.full_name) continue;
          const normName = item.full_name.trim().toLowerCase();
          
          if (seenStore.isSeen(normName)) {
            seenDetailsToBatch.push({ fullName: normName, repo: item });
            continue;
          }
          if (localSeenInSession.has(normName)) {
            continue;
          }

          localSeenInSession.add(normName);
          collected.push({ ...item, timeframe: tf });
          addedInThisTimeframe++;
        }

        if (!primaryTimeframeSet && addedInThisTimeframe > 0) {
          this.activeTimeframe = tf;
          primaryTimeframeSet = true;
        }
      } catch (err) {
        console.warn(`Failed to fetch ${tf} timeframe:`, err);
      }
    }

    if (fetchId !== this._fetchId) return;

    if (seenDetailsToBatch.length > 0) {
      seenStore.setSeenDetailsBatch(seenDetailsToBatch);
    }

    this.repos = collected;
    this.loading = false;

    if (networkSuccessCount === 0) {
      this.error = 'Failed to load repository feed. Please check your network connection and try again.';
    } else {
      this.error = null;
    }
  }
}

export const repoFeed = new RepoFeed();
