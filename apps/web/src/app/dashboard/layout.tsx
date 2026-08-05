'use client';

import { AppHeader } from '@/components/dashboard/app-header';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto bg-background/50">{children}</main>
      </div>
    </SidebarProvider>
  );
}
