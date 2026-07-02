"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getInspectionPointByCode } from "@/lib/api/inspectionPoints";
import { createInspection } from "@/lib/api/inspections";
import { getStoredUser } from "@/lib/api/session";
import { ApiError } from "@/lib/api/http";
import type { InspectionPoint, VisualCondition } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CodeBadge } from "@/components/ui/CodeBadge";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { ArrowLeft, Bell, Camera, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const VISUAL_CONDITION_OPTIONS: { value: VisualCondition; label: string; tone?: "warning" | "danger" }[] = [
  { value: "BOA", label: "BOM" },
  { value: "REGULAR", label: "REGULAR", tone: "warning" },
  { value: "RUIM", label: "CRÍTICO", tone: "danger" },
];

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function NovaInspecaoClient({ codigo }: { codigo: string }) {
  const router = useRouter();
  const [point, setPoint] = useState<InspectionPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [inspectionDate, setInspectionDate] = useState(todayIsoDate());
  const [responsibleName, setResponsibleName] = useState("");
  const [visualCondition, setVisualCondition] = useState<VisualCondition>("BOA");
  const [electricalContinuityMohm, setElectricalContinuityMohm] = useState("");
  const [groundingResistanceOhm, setGroundingResistanceOhm] = useState("");
  const [hasOxidation, setHasOxidation] = useState(false);
  const [needsCorrection, setNeedsCorrection] = useState(false);
  const [conforming, setConforming] = useState(true);
  const [observations, setObservations] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user) setResponsibleName(user.name);

    getInspectionPointByCode(codigo)
      .then(setPoint)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar o ponto."));
  }, [codigo]);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createInspection(codigo, {
        inspectionDate,
        responsibleName: responsibleName || undefined,
        visualCondition,
        electricalContinuityMohm: electricalContinuityMohm ? Number(electricalContinuityMohm) : undefined,
        groundingResistanceOhm: groundingResistanceOhm ? Number(groundingResistanceOhm) : undefined,
        hasOxidation,
        needsCorrection,
        conforming,
        observations: observations || undefined,
      });
      router.push(`/pontos/${codigo}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível registrar a inspeção.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link href={`/pontos/${codigo}`} className="flex items-center gap-2 text-sm font-medium text-accent">
          <ArrowLeft className="h-4 w-4" />
          Nova Inspeção
        </Link>
        <Bell className="h-5 w-5 text-fg-muted" />
      </div>

      <Card className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Código do Ponto</span>
        <CodeBadge code={point?.code ?? codigo} className="w-fit" />
      </Card>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Data da Inspeção"
            type="date"
            required
            value={inspectionDate}
            onChange={(e) => setInspectionDate(e.target.value)}
          />
          <Input
            label="Responsável Técnico"
            placeholder="Nome do responsável"
            value={responsibleName}
            onChange={(e) => setResponsibleName(e.target.value)}
          />

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-subtle">Medições Técnicas</p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Continuidade (mΩ)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={electricalContinuityMohm}
                onChange={(e) => setElectricalContinuityMohm(e.target.value)}
              />
              <Input
                label="Resistência (Ω)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={groundingResistanceOhm}
                onChange={(e) => setGroundingResistanceOhm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-fg-muted">Condição Visual do Ativo</span>
            <SegmentedControl
              options={VISUAL_CONDITION_OPTIONS}
              value={visualCondition}
              onChange={setVisualCondition}
            />
          </div>

          <div className="flex flex-col divide-y divide-border">
            <Switch checked={hasOxidation} onChange={setHasOxidation} label="Presença de Oxidação" />
            <Switch checked={needsCorrection} onChange={setNeedsCorrection} label="Necessita Correção" />
            <Switch
              checked={conforming}
              onChange={setConforming}
              label="Conforme"
              icon={conforming ? <CheckCircle2 className="h-4 w-4 text-accent" /> : undefined}
            />
          </div>

          <Textarea
            label="Observações Técnicas"
            placeholder="Descreva anomalias ou detalhes técnicos da inspeção..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-subtle">Registro Fotográfico</p>
            <div className="flex items-center gap-3">
              <label className="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-fg-subtle hover:border-border-strong hover:text-fg-muted">
                <Camera className="h-5 w-5" />
                <span className="text-[10px] font-medium">ADICIONAR</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
              {photoPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="Prévia da foto" className="h-20 w-20 rounded-lg object-cover" />
              )}
            </div>
            {photoPreview && (
              <p className="mt-1 text-xs text-fg-subtle">Anexo local — envio ao servidor ainda não implementado.</p>
            )}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" loading={submitting}>
            {submitting ? "Registrando..." : "Registrar Inspeção"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
