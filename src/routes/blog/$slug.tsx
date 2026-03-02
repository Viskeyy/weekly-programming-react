import { getPostContent } from '@/lib/posts';
import { createFileRoute } from '@tanstack/react-router';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const Route = createFileRoute('/blog/$slug')({
    component: BlogPost,
});

function BlogPost() {
    const { slug } = Route.useParams();
    const content = getPostContent(slug);

    if (!content) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-zinc-50">Post not found</h1>
                <p className="mt-2 text-zinc-400">The post &quot;{slug}&quot; could not be found.</p>
            </div>
        );
    }

    return (
        <article className="max-w-[720px] p-8">
            <div className="prose prose-invert prose-zinc max-w-none">
                <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
            </div>
        </article>
    );
}
