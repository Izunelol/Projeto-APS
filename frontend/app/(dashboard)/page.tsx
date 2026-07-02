"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDashboardSummary } from "@/lib/api/dashboard";
import { getInspectionPointByCode, listInspectionPoints } from "@/lib/api/inspectionPoints";
import { ApiError } from "@/lib/api/http";
import { formatRelativeTime } from "@/lib/format";
import type { DashboardSummary, InspectionPoint, PointStatus } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CodeBadge } from "@/components/ui/CodeBadge";
import { Input } from "@/components/ui/Input";
import { StatTile } from "@/components/ui/StatTile";
import { ChevronRight, QrCode } from "lucide-react";

const STATUS_BADGE: Record<PointStatus, "success" | "neutral" | "danger"> = {
  ATIVO: "success",
  INATIVO: "neutral",
  DESATIVADO: "danger",
};

export default function DashboardHomePage() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<InspectionPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const [scanCode, setScanCode] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getDashboardSummary(), listInspectionPoints({ page: 0, size: 5 })])
      .then(([summaryResult, pointsResult]) => {
        setSummary(summaryResult);
        setRecent(pointsResult.content);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleScanSubmit(event: FormEvent) {
    event.preventDefault();
    setScanError(null);
    if (!scanCode.trim()) return;
    setScanning(true);
    try {
      const point = await getInspectionPointByCode(scanCode.trim().toUpperCase());
      router.push(`/pontos/${point.code}`);
    } catch (err) {
      setScanError(err instanceof ApiError ? err.message : "Ponto não encontrado.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-fg">Painel</h1>
        <p className="text-sm text-fg-muted">
          Visão geral dos pontos de inspeção de SPDA e das inspeções registradas.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-4 border-accent/30 bg-accent-soft text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-fg">
          <QrCode className="h-7 w-7" />
        </span>
        <div>
          <p className="text-sm font-semibold text-fg">Quick Scan</p>
          <p className="text-xs text-fg-muted">Aponte para a tag NFC ou QR Code do ponto de inspeção</p>
        </div>
        <form onSubmit={handleScanSubmit} className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Digite o código do ponto"
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value)}
            />
          </div>
          <Button type="submit" loading={scanning}>
            Escanear Ponto Agora
          </Button>
        </form>
        {scanError && <p className="text-xs text-danger">{scanError}</p>}
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile label="Inspeções Hoje" value={loading ? "—" : String(summary?.inspectionsToday ?? 0)} />
        <StatTile
          label="Pontos Conformes"
          value={loading ? "—" : `${Math.round(summary?.conformingPercentage ?? 0)}%`}
          accent="success"
          progressPercent={summary?.conformingPercentage}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg">Atividades Recentes</h2>
          <Link href="/pontos" className="text-xs font-medium text-accent hover:underline">
            Ver tudo
          </Link>
        </div>

        <Card padding="none">
          {loading ? (
            <p className="p-4 text-sm text-fg-muted">Carregando...</p>
          ) : recent.length === 0 ? (
            <p className="p-4 text-sm text-fg-muted">Nenhum ponto cadastrado ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((point) => (
                <li key={point.id}>
                  <Link
                    href={`/pontos/${point.code}`}
                    className="flex items-center justify-between gap-3 p-4 hover:bg-surface-alt"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <CodeBadge code={point.code} />
                        <Badge variant={STATUS_BADGE[point.status]}>{point.status}</Badge>
                      </div>
                      <p className="text-xs text-fg-muted">
                        {point.areaName} • {point.locationDescription || "Sem localização"} •{" "}
                        {formatRelativeTime(point.updatedAt)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-fg-subtle" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
