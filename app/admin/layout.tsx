import { ReactNode } from 'react';

export const metadata = {
    title: 'Administración',
    description: 'Gestión de usuarios',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen">
            <main className="overflow-y-auto w-full">{children}</main>
        </div>
    );
}
