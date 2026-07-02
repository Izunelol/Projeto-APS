"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/lib/types";

const links = [
  { href: "/", label: "Início" },
  { href: "/pontos", label: "Pontos" },
  { href: "/indicadores", label: "Indicadores" },
  { href: "/configuracoes/clientes", label: "Clientes" },
  { href: "/configuracoes/areas", label: "Áreas" },
  { href: "/configuracoes/tipos-de-ponto", label: "Tipos de Ponto" },
];

interface DashboardNavProps {
  user: User;
  onLogout: () => void;
}

export function DashboardNav({ user, onLogout }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-zinc-900">SmartLab</span>
          <button
            onClick={onLogout}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:hidden"
          >
            Sair
          </button>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-medium ${
                pathname === link.href ? "text-blue-600" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="text-sm text-zinc-600">{user.name}</span>
          <button
            onClick={onLogout}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
