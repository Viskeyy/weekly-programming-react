import { postSlugs } from '@/lib/posts';
import { Link } from '@tanstack/react-router';

export function Sidebar() {
    return (
        <aside className="w-[256px] border-r border-zinc-700 pr-6">
            <Link to="/" className="mb-6 block text-xl font-bold text-zinc-50">
                Weekly Programming
            </Link>
            <nav>
                <ul className="space-y-2">
                    <li>
                        <Link
                            to="/"
                            className="block rounded px-3 py-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-50"
                            activeProps={{ className: 'block px-3 py-2 rounded text-blue-400 bg-zinc-800' }}
                        >
                            Home
                        </Link>
                    </li>
                    {postSlugs.map((slug) => {
                        const weekNum = slug.match(/_(\d+)$/)?.[1] ?? slug;
                        return (
                            <li key={slug}>
                                <Link
                                    to="/blog/$slug"
                                    params={{ slug }}
                                    className="block rounded px-3 py-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-50"
                                    activeProps={{ className: 'block px-3 py-2 rounded text-blue-400 bg-zinc-800' }}
                                >
                                    Week {weekNum}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
