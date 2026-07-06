"use client";

import { useEffect, useState } from "react";
import { getDashboardSummary, getIndicatorsByArea, getIndicatorsByType, getMeasurementsTrend } from "@/lib/api/dashboard";
import { listInspectionPoints } from "@/lib/api/inspectionPoints";
import { ApiError } from "@/lib/api/http";
import type {
  AreaIndicator,
  DashboardSummary,
  InspectionPoint,
  MeasurementTrendPoint,
  PointTypeIndicator,
} from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { StatTile } from "@/components/ui/StatTile";
import { ConformityBarChart } from "@/components/charts/ConformityBarChart";
import { MeasurementLineChart } from "@/components/charts/MeasurementLineChart";
import { Download } from "lucide-react";

function toCsv(byArea: AreaIndicator[], byType: PointTypeIndicator[]): string {
  const lines: string[] = [];
  lines.push("Indicador,Nome,Pontos,Inspeções,Conformes,Não Conformes,% Conforme");
  for (const row of byArea) {
    lines.push(
      `Área,"${row.areaName}",${row.totalPoints},${row.totalInspections},${row.conformingCount},${row.nonConformingCount},${row.conformingPercentage.toFixed(1)}`,
    );
  }
  for (const row of byType) {
    lines.push(
      `Tipo de Ponto,"${row.pointTypeName}",${row.totalPoints},${row.totalInspections},${row.conformingCount},${row.nonConformingCount},${row.conformingPercentage.toFixed(1)}`,
    );
  }
  return lines.join("\n");
}

export default function IndicadoresPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [byArea, setByArea] = useState<AreaIndicator[]>([]);
  const [byType, setByType] = useState<PointTypeIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [points, setPoints] = useState<InspectionPoint[]>([]);
  const [selectedPointCode, setSelectedPointCode] = useState("");
  const [trend, setTrend] = useState<MeasurementTrendPoint[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getDashboardSummary(), getIndicatorsByArea(), getIndicatorsByType(), listInspectionPoints({ size: 100 })])
      .then(([summaryResult, byAreaResult, byTypeResult, pointsResult]) => {
        setSummary(summaryResult);
        setByArea(byAreaResult);
        setByType(byTypeResult);
        setPoints(pointsResult.content);
        if (pointsResult.content.length > 0) {
          setSelectedPointCode(pointsResult.content[0].code);
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar os indicadores."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedPointCode) {
      setTrend([]);
      return;
    }
    setLoadingTrend(true);
    getMeasurementsTrend(selectedPointCode)
      .then(setTrend)
      .catch(() => setTrend([]))
      .finally(() => setLoadingTrend(false));
  }, [selectedPointCode]);

  function handleExportCsv() {
    const csv = toCsv(byArea, byType);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "indicadores.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const continuityData = trend.map((t) => ({ inspectionDate: t.inspectionDate, value: t.electricalContinuityMohm ?? null }));
  const resistanceData = trend.map((t) => ({ inspectionDate: t.inspectionDate, value: t.groundingResistanceOhm ?? null }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Indicadores</h1>
          <p className="text-sm text-fg-muted">
            Conformidade agregada por área e tipo de ponto, e tendência de medições.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={handleExportCsv} disabled={loading}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Total de Pontos" value={loading ? "—" : String(summary?.totalPoints ?? 0)} />
        <StatTile label="Total de Inspeções" value={loading ? "—" : String(summary?.totalInspections ?? 0)} />
        <StatTile
          label="Conformidade"
          value={loading ? "—" : `${Math.round(summary?.conformingPercentage ?? 0)}%`}
          accent="success"
          progressPercent={summary?.conformingPercentage}
        />
        <StatTile label="Inspeções Hoje" value={loading ? "—" : String(summary?.inspectionsToday ?? 0)} />
      </div>

      <Card className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-fg">Conformidade por Área</p>
        {loading ? <p className="text-sm text-fg-muted">Carregando...</p> : <ConformityBarChart data={byArea.map((a) => ({
          id: a.areaId,
          label: a.areaName,
          totalPoints: a.totalPoints,
          conformingCount: a.conformingCount,
          nonConformingCount: a.nonConformingCount,
          conformingPercentage: a.conformingPercentage,
        }))} />}
      </Card>

      <Card className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-fg">Conformidade por Tipo de Ponto</p>
        {loading ? <p className="text-sm text-fg-muted">Carregando...</p> : <ConformityBarChart data={byType.map((t) => ({
          id: t.pointTypeId,
          label: t.pointTypeName,
          totalPoints: t.totalPoints,
          conformingCount: t.conformingCount,
          nonConformingCount: t.nonConformingCount,
          conformingPercentage: t.conformingPercentage,
        }))} />}
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-fg">Tendência de Medições</p>
          <div className="w-full sm:w-64">
            <Select value={selectedPointCode} onChange={(e) => setSelectedPointCode(e.target.value)}>
              <option value="">Selecione um ponto</option>
              {points.map((point) => (
                <option key={point.id} value={point.code}>
                  {point.code}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {loadingTrend ? (
          <p className="text-sm text-fg-muted">Carregando tendência...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <MeasurementLineChart title="Continuidade Elétrica" unit="mΩ" data={continuityData} />
            <MeasurementLineChart title="Resistência de Aterramento" unit="Ω" data={resistanceData} />
          </div>
        )}
      </Card>
    </div>
  );
}
