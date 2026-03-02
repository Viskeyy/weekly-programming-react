import { Sidebar } from '@/components/Sidebar';
import { Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    return (
        <div className="mx-auto flex h-screen max-w-[1280px] gap-12 bg-zinc-900 p-4 text-zinc-50">
            <Sidebar />
            <main className="max-w-[720px] flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
