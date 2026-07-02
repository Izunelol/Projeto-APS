"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listClients } from "@/lib/api/clients";
import { listPointTypes } from "@/lib/api/pointTypes";
import { Card } from "@/components/ui/Card";
import { Building2, ChevronRight, Plug, ShieldCheck } from "lucide-react";

interface ConfigSection {
  href: string;
  icon: typeof Building2;
  title: string;
  subtitle: string;
}

export default function ConfiguracoesPage() {
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [pointTypeCount, setPointTypeCount] = useState<number | null>(null);

  useEffect(() => {
    listClients(0, 1)
      .then((page) => setClientCount(page.totalElements))
      .catch(() => setClientCount(null));
    listPointTypes(0, 1)
      .then((page) => setPointTypeCount(page.totalElements))
      .catch(() => setPointTypeCount(null));
  }, []);

  const sections: ConfigSection[] = [
    {
      href: "/configuracoes/clientes",
      icon: Building2,
      title: "Clientes",
      subtitle:
        clientCount === null
          ? "Gerencie clientes, unidades e áreas"
          : `${clientCount} cliente(s) — unidades e áreas agrupadas por cliente`,
    },
    {
      href: "/configuracoes/tipos-de-ponto",
      icon: Plug,
      title: "Tipos de Ponto",
      subtitle:
        pointTypeCount === null ? "Siglas de dispositivo de inspeção" : `${pointTypeCount} tipo(s) cadastrado(s)`,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-fg">Configurações do Sistema</h1>
          <p className="text-sm text-fg-muted">Gerencie ativos, permissões e parâmetros técnicos.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="flex items-center justify-between transition-colors hover:border-border-strong">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-alt text-accent">
                  <section.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-fg">{section.title}</p>
                  <p className="text-xs text-fg-muted">{section.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-fg-subtle" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
