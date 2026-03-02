import { getPostFiles, getPostSlug } from '@/lib/posts';

export const Sidebar = async () => {
    const files = getPostFiles(); // runs on the server
    return (
        <aside className="w-[256px]">
            <a href="/">Weekly Programming</a>
            <nav>
                <ul>
                    <li>
                        <a href="/">Home</a>
                    </li>
                    {files.map((f) => {
                        const slug = getPostSlug(f);
                        return (
                            <li key={f}>
                                <a href={`/blog/${slug}`}>{slug.replace(/_/g, ' ')}</a>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};
