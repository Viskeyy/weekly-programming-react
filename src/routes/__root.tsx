import { Layout } from '@/components/Layout';
import { Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}
