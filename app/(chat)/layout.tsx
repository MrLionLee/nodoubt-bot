import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { auth } from '../(auth)/auth';
import Script from 'next/script';


export const experimental_ppr = true;

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
      const [session, cookieStore] = await Promise.all([auth(), cookies()]);
      console.info('session', session);
      console.info('cookieStore', cookieStore);
    return (
        <>
            <Script
                src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
                strategy="beforeInteractive"
            />
            <SidebarProvider defaultOpen={true}>
                <AppSidebar user={session?.user} />
                <SidebarInset>
                    {children}
                </SidebarInset>
            </SidebarProvider>

        </>
    );
}
