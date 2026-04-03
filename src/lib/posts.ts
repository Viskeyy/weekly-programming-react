// Explicit imports required - Rspack doesn't support import.meta.glob
import week9 from '@/content/2026/Weekly_Programming_26_9.md?raw';
import week2 from '@/content/2026/weekly_programming_26_2.md?raw';
import week3 from '@/content/2026/weekly_programming_26_3.md?raw';
import week4 from '@/content/2026/weekly_programming_26_4.md?raw';
import week5 from '@/content/2026/weekly_programming_26_5.md?raw';
import week6 from '@/content/2026/weekly_programming_26_6.md?raw';
import week7 from '@/content/2026/weekly_programming_26_7.md?raw';
import week10 from '@/content/2026/weekly_programming_26_10.md?raw';
import week11 from '@/content/2026/weekly_programming_26_11.md?raw';
import week12 from '@/content/2026/weekly_programming_26_12.md?raw';
import week13 from '@/content/2026/weekly_programming_26_13.md?raw';
import week14 from '@/content/2026/weekly_programming_26_14.md?raw';

export const postsMap: Record<string, string> = {
    weekly_programming_26_2: week2,
    weekly_programming_26_3: week3,
    weekly_programming_26_4: week4,
    weekly_programming_26_5: week5,
    weekly_programming_26_6: week6,
    weekly_programming_26_7: week7,
    Weekly_Programming_26_9: week9,
    weekly_programming_26_10: week10,
    weekly_programming_26_11: week11,
    weekly_programming_26_12: week12,
    weekly_programming_26_13: week13,
    weekly_programming_26_14: week14,
};

export const postSlugs = Object.keys(postsMap).sort((a, b) => {
    const weekA = Number.parseInt(/\d+$/.exec(a)?.[0] ?? '0');
    const weekB = Number.parseInt(/\d+$/.exec(b)?.[0] ?? '0');
    return weekA - weekB;
});

export function getPostContent(slug: string): string | null {
    return postsMap[slug] ?? null;
}
