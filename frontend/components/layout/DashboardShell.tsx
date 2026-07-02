"use client";

import { ReactNode } from "react";
import { useSession } from "@/lib/hooks/useSession";
import { DashboardNav } from "@/components/layout/DashboardNav";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { loading, user, logout } = useSession(true);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-fg-muted">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg">
      <DashboardNav user={user} onLogout={logout} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
