// src/lib/posts.ts
import fs from 'fs';
import path from 'path';

const postsDir = path.join(process.cwd(), 'src/content/2026'); // or ../content

export function getPostFiles(): string[] {
    return fs.readdirSync(postsDir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
}

export function getPostSlug(file: string) {
    return file.replace(/\.(mdx?)$/, '');
}
