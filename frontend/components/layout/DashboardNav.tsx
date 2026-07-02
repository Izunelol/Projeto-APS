"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import type { User } from "@/lib/types";

const links = [
  { href: "/", label: "Início" },
  { href: "/pontos", label: "Pontos" },
  { href: "/indicadores", label: "Indicadores" },
  { href: "/configuracoes", label: "Configurações" },
];

interface DashboardNavProps {
  user: User;
  onLogout: () => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function DashboardNav({ user, onLogout }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4">
          <span className="text-lg font-semibold text-fg">
            Smart<span className="text-accent">Lab</span>
          </span>
          <button
            onClick={onLogout}
            className="text-sm font-medium text-fg-muted hover:text-fg sm:hidden"
          >
            Sair
          </button>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium ${active ? "text-accent" : "text-fg-muted hover:text-fg"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-4 sm:flex">
          <button
            type="button"
            className="rounded-full p-1.5 text-fg-muted hover:bg-surface-alt hover:text-fg"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
              {initials(user.name)}
            </span>
            <span className="text-sm text-fg-muted">{user.name}</span>
          </div>
          <button
            onClick={onLogout}
            className="text-sm font-medium text-fg-muted hover:text-fg"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
