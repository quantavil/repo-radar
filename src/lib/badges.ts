
const BADGE_FAMILIES = [
  { bg: 'bg-[var(--badge-blue-bg)]', text: 'text-[var(--badge-blue-text)]' },
  { bg: 'bg-[var(--badge-red-bg)]', text: 'text-[var(--badge-red-text)]' },
  { bg: 'bg-[var(--badge-yellow-bg)]', text: 'text-[var(--badge-yellow-text)]' },
  { bg: 'bg-[var(--badge-green-bg)]', text: 'text-[var(--badge-green-text)]' },
] as const;

// Explicit mapping for languages with strong associations
const EXPLICIT_MAP: Record<string, number> = {
  python: 0,   // blue
  go: 0,       // blue
  java: 0,     // blue
  rust: 1,     // red
  ruby: 1,     // red
  swift: 1,    // red
  typescript: 2, // yellow
  javascript: 2, // yellow
  kotlin: 2,   // yellow
  dart: 2,     // yellow
  cpp: 3,      // green
  csharp: 3,   // green
  php: 3,      // green
  zig: 3,      // green
};

export function getLanguageBadgeStyle(lang: string): string {
  const l = (lang || '').toLowerCase();
  const idx = EXPLICIT_MAP[l];
  const family = idx !== undefined ? BADGE_FAMILIES[idx] : BADGE_FAMILIES[3];
  return `${family.bg} ${family.text}`;
}
