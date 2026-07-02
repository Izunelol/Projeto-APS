"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { getInspectionPointByCode } from "@/lib/api/inspectionPoints";
import { listInspectionsByPointCode } from "@/lib/api/inspections";
import { ApiError } from "@/lib/api/http";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Inspection, InspectionPoint } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CodeBadge } from "@/components/ui/CodeBadge";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Camera,
  ChevronDown,
  ChevronRight,
  Download,
  QrCode,
} from "lucide-react";

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">{label}</p>
      <p className="text-sm text-fg">{value}</p>
    </div>
  );
}

export function FichaDoPontoClient({ codigo }: { codigo: string }) {
  const [point, setPoint] = useState<InspectionPoint | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedInspectionId, setExpandedInspectionId] = useState<string | null>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [generatingQr, setGeneratingQr] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getInspectionPointByCode(codigo), listInspectionsByPointCode(codigo)])
      .then(([pointResult, inspectionsResult]) => {
        setPoint(pointResult);
        setInspections(inspectionsResult);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar o ponto."))
      .finally(() => setLoading(false));
  }, [codigo]);

  async function handleGenerateQr() {
    if (!point) return;
    setGeneratingQr(true);
    try {
      const url = `${window.location.origin}/pontos/${point.code}`;
      setQrDataUrl(await QRCode.toDataURL(url, { margin: 1, width: 220 }));
    } finally {
      setGeneratingQr(false);
    }
  }

  function downloadQrCode() {
    if (!qrDataUrl || !point) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${point.code}.png`;
    link.click();
  }

  if (loading) {
    return <p className="text-sm text-fg-muted">Carregando...</p>;
  }

  if (error || !point) {
    return <p className="text-sm text-danger">{error ?? "Ponto não encontrado."}</p>;
  }

  const latestInspection = inspections[0];
  const conformityBadge = !latestInspection
    ? { label: "Sem inspeção", variant: "neutral" as const }
    : latestInspection.conforming
      ? { label: "Conforme", variant: "success" as const }
      : { label: "Não Conforme", variant: "danger" as const };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link href="/pontos" className="flex items-center gap-2 text-sm font-medium text-accent">
          <ArrowLeft className="h-4 w-4" />
          Ficha do Ponto
        </Link>
        <Bell className="h-5 w-5 text-fg-muted" />
      </div>

      <Card padding="none" className="flex h-40 items-center justify-center overflow-hidden">
        {point.referencePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={point.referencePhotoUrl} alt={point.code} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-fg-subtle">
            <Camera className="h-8 w-8" />
            <span className="text-xs">Sem foto de referência</span>
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <CodeBadge code={point.code} className="w-fit" />
          <Button type="button" variant="outline" size="sm" loading={generatingQr} onClick={handleGenerateQr}>
            <QrCode className="h-4 w-4" />
            Gerar QR Code
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-fg">
            {point.areaName} - Ponto {String(point.sequenceNumber).padStart(3, "0")}
          </h1>
          <Badge variant={conformityBadge.variant}>{conformityBadge.label}</Badge>
        </div>
      </div>

      {qrDataUrl && (
        <Card className="flex flex-col items-center gap-3 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt={`QR Code do ponto ${point.code}`} className="rounded-lg border border-border" />
          <p className="text-xs text-fg-subtle">Pronto para impressão em etiqueta térmica industrial.</p>
          <Button type="button" variant="outline" onClick={downloadQrCode}>
            Baixar QR Code
          </Button>
        </Card>
      )}

      <Card className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Localização</p>
          <p className="text-sm text-fg">{point.locationDescription || "Não informada"}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Área</p>
            <p className="text-sm text-fg">{point.areaName}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Tipo</p>
            <p className="text-sm text-fg">{point.pointTypeName}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Última Inspeção</p>
          <div className="flex items-center gap-2 text-sm text-fg">
            <Calendar className="h-4 w-4 text-fg-subtle" />
            {latestInspection ? formatDate(latestInspection.inspectionDate) : "Nenhuma inspeção registrada"}
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={`/pontos/${point.code}/nova-inspecao`} className="flex-1">
          <Button type="button" className="w-full">
            Nova Inspeção
          </Button>
        </Link>
        <Button type="button" variant="outline" className="flex-1" onClick={() => setShowHistory((v) => !v)}>
          {showHistory ? "Ocultar Histórico" : "Ver Histórico"}
        </Button>
      </div>

      <button
        type="button"
        disabled
        title="Em breve"
        className="flex items-center justify-center gap-2 text-sm text-fg-subtle disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4" />
        Baixar Relatório Completo (PDF)
      </button>

      {showHistory && (
        <Card className="flex flex-col gap-3">
          <p className="text-sm font-medium text-fg">Histórico de Inspeções</p>
          {inspections.length === 0 ? (
            <p className="text-sm text-fg-muted">Nenhuma inspeção registrada ainda.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {inspections.map((inspection) => {
                const expanded = expandedInspectionId === inspection.id;
                return (
                  <li key={inspection.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => setExpandedInspectionId(expanded ? null : inspection.id)}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <div>
                        <span className="text-sm font-medium text-fg">{formatDate(inspection.inspectionDate)}</span>
                        <p className="text-xs text-fg-muted">
                          Condição visual: {inspection.visualCondition} • Responsável:{" "}
                          {inspection.responsibleName || inspection.inspectorName || "Não informado"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={inspection.conforming ? "success" : "danger"}>
                          {inspection.conforming ? "Conforme" : "Não Conforme"}
                        </Badge>
                        {expanded ? (
                          <ChevronDown className="h-4 w-4 text-fg-subtle" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-fg-subtle" />
                        )}
                      </div>
                    </button>

                    {expanded && (
                      <div className="mt-3 flex flex-col gap-3 rounded-lg border border-border bg-surface-alt p-3">
                        <div className="grid grid-cols-2 gap-3">
                          <DetailField
                            label="Continuidade"
                            value={
                              inspection.electricalContinuityMohm != null
                                ? `${inspection.electricalContinuityMohm} mΩ`
                                : "Não medido"
                            }
                          />
                          <DetailField
                            label="Resistência"
                            value={
                              inspection.groundingResistanceOhm != null
                                ? `${inspection.groundingResistanceOhm} Ω`
                                : "Não medido"
                            }
                          />
                          <DetailField label="Presença de Oxidação" value={inspection.hasOxidation ? "Sim" : "Não"} />
                          <DetailField
                            label="Necessita Correção"
                            value={inspection.needsCorrection ? "Sim" : "Não"}
                          />
                          <DetailField label="Inspetor" value={inspection.inspectorName || "Não informado"} />
                          <DetailField label="Registrada em" value={formatDateTime(inspection.createdAt)} />
                        </div>
                        {inspection.observations && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
                              Observações
                            </p>
                            <p className="text-sm text-fg">{inspection.observations}</p>
                          </div>
                        )}
                        {inspection.photoUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={inspection.photoUrl}
                            alt="Foto da inspeção"
                            className="max-h-48 rounded-lg object-cover"
                          />
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
