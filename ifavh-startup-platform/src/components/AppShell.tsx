"use client";

import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen">
          <TopNav />
          <div className="flex-1">{children}</div>
        </main>
      </AuthGuard>
    </AuthProvider>
  );
}
