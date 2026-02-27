import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import * as React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
            <Footer />
        </div>
    );
};
