'use client';

import { DashboardTopbar } from './dashboard-topbar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background ">
      <DashboardTopbar />
      <main className="flex-1 p-5 flex flex-col">
        {children}
      </main>
    </div>
  );
}

