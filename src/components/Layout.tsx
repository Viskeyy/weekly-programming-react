import { Sidebar } from '@/components/Sidebar';
import * as React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="mx-auto flex h-screen max-w-[1280px] p-4">
            <Sidebar />
            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    );
};
