"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { listClients } from "@/lib/api/clients";
import { listUnitsByClient } from "@/lib/api/units";
import { listAreasByUnit } from "@/lib/api/areas";
import { listPointTypes } from "@/lib/api/pointTypes";
import { createInspectionPoint } from "@/lib/api/inspectionPoints";
import { uploadFile } from "@/lib/api/uploads";
import { ApiError } from "@/lib/api/http";
import type { Area, Client, Criticality, InspectionPoint, PointStatus, PointType } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CodeBadge } from "@/components/ui/CodeBadge";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { Camera, CheckCircle2, MapPin, QrCode, Zap } from "lucide-react";

type AreaOption = Area & { unitName: string };

const CRITICALITY_OPTIONS: { value: Criticality; label: string; tone?: "warning" | "danger" }[] = [
  { value: "BAIXA", label: "BAIXA" },
  { value: "MEDIA", label: "MÉDIA", tone: "warning" },
  { value: "ALTA", label: "ALTA", tone: "danger" },
];

export default function NovoPontoPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [pointTypes, setPointTypes] = useState<PointType[]>([]);
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>([]);

  const [clientId, setClientId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [pointTypeId, setPointTypeId] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<PointStatus>("ATIVO");
  const [criticality, setCriticality] = useState<Criticality>("MEDIA");
  const [referencePhotoUrl, setReferencePhotoUrl] = useState<string | undefined>(undefined);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [loadingAreas, setLoadingAreas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [createdPoint, setCreatedPoint] = useState<InspectionPoint | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    listClients(0, 100)
      .then((page) => setClients(page.content))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar os clientes."));
    listPointTypes(0, 100)
      .then((page) => setPointTypes(page.content))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar os tipos de ponto."));
  }, []);

  useEffect(() => {
    setAreaId("");
    setAreaOptions([]);
    if (!clientId) return;
    setLoadingAreas(true);
    (async () => {
      try {
        const units = await listUnitsByClient(clientId);
        const perUnit = await Promise.all(
          units.map(async (unit) => {
            const areas = await listAreasByUnit(unit.id);
            return areas.map((area) => ({ ...area, unitName: unit.name }));
          }),
        );
        setAreaOptions(perUnit.flat());
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Não foi possível carregar as áreas.");
      } finally {
        setLoadingAreas(false);
      }
    })();
  }, [clientId]);

  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedArea = areaOptions.find((a) => a.id === areaId);
  const selectedPointType = pointTypes.find((p) => p.id === pointTypeId);
  const multipleUnits = new Set(areaOptions.map((a) => a.unitName)).size > 1;

  const codePreview =
    selectedClient && selectedArea && selectedPointType
      ? `${selectedClient.acronym}-SPDA-${selectedArea.acronym}-${selectedPointType.acronym}-???`
      : null;

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      setReferencePhotoUrl(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível enviar a foto.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!areaId || !pointTypeId) {
      setError("Selecione cliente, área e tipo de ponto.");
      return;
    }
    setSubmitting(true);
    try {
      const point = await createInspectionPoint({
        areaId,
        pointTypeId,
        locationDescription: locationDescription || undefined,
        description: description || undefined,
        status,
        criticality,
        referencePhotoUrl,
      });
      setCreatedPoint(point);
      const url = `${window.location.origin}/pontos/${point.code}`;
      setQrDataUrl(await QRCode.toDataURL(url, { margin: 1, width: 220 }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o ponto.");
    } finally {
      setSubmitting(false);
    }
  }

  function downloadQrCode() {
    if (!qrDataUrl || !createdPoint) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${createdPoint.code}.png`;
    link.click();
  }

  if (createdPoint) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="flex items-center gap-2 text-accent">
          <CheckCircle2 className="h-5 w-5" />
          <h1 className="text-xl font-semibold text-fg">Ponto cadastrado com sucesso</h1>
        </div>
        <Card className="flex flex-col items-center gap-4 text-center">
          <CodeBadge code={createdPoint.code} className="text-base" />
          <p className="text-sm text-fg-muted">
            {createdPoint.locationDescription || "Sem localização informada"}
          </p>
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt={`QR Code do ponto ${createdPoint.code}`} className="rounded-lg border border-border" />
          )}
          <p className="text-xs text-fg-subtle">Pronto para impressão em etiqueta térmica industrial.</p>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" className="flex-1" onClick={downloadQrCode}>
              Baixar QR Code
            </Button>
            <Link href={`/pontos/${createdPoint.code}`} className="flex-1">
              <Button type="button" className="w-full">
                Ver Ficha do Ponto
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-accent" />
        <div>
          <h1 className="text-2xl font-semibold text-fg">Cadastro de Ponto</h1>
          <p className="text-sm text-fg-muted">Novo ponto de inspeção de SPDA com código gerado automaticamente.</p>
        </div>
      </div>

      <Card className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Código Gerado</span>
        <div className="flex items-center justify-between">
          <CodeBadge code={codePreview ?? "Selecione cliente, área e tipo"} />
        </div>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select label="Cliente" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
            <option value="">Selecione o cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.acronym})
              </option>
            ))}
          </Select>

          <Select
            label="Área"
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            disabled={!clientId || loadingAreas}
            required
          >
            <option value="">{loadingAreas ? "Carregando áreas..." : "Selecione a área"}</option>
            {areaOptions.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name} ({area.acronym}){multipleUnits ? ` — ${area.unitName}` : ""}
              </option>
            ))}
          </Select>

          <Select
            label="Tipo de Dispositivo"
            value={pointTypeId}
            onChange={(e) => setPointTypeId(e.target.value)}
            required
          >
            <option value="">Selecione o tipo de ponto</option>
            {pointTypes.map((pointType) => (
              <option key={pointType.id} value={pointType.id}>
                {pointType.name} ({pointType.acronym})
              </option>
            ))}
          </Select>

          <Input
            label="Localização"
            placeholder="Coordenadas ou descrição física"
            icon={<MapPin className="h-4 w-4" />}
            value={locationDescription}
            onChange={(e) => setLocationDescription(e.target.value)}
          />

          <Switch
            checked={status === "ATIVO"}
            onChange={(checked) => setStatus(checked ? "ATIVO" : "INATIVO")}
            label="Status do Ativo"
            description={status === "ATIVO" ? "Ativo" : "Inativo"}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-fg-muted">Criticidade</span>
            <SegmentedControl options={CRITICALITY_OPTIONS} value={criticality} onChange={setCriticality} />
          </div>

          <Textarea
            label="Observações Técnicas"
            placeholder="Detalhes adicionais sobre o ponto de medição..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-subtle">Foto de Referência</p>
            <div className="flex items-center gap-3">
              <label className="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-fg-subtle hover:border-border-strong hover:text-fg-muted">
                <Camera className="h-5 w-5" />
                <span className="text-[10px] font-medium">ADICIONAR</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
              {photoPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="Prévia da foto de referência" className="h-20 w-20 rounded-lg object-cover" />
              )}
            </div>
            {uploadingPhoto && <p className="mt-1 text-xs text-fg-subtle">Enviando foto...</p>}
          </div>

          <Card padding="sm" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-alt text-fg-subtle">
              <QrCode className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-fg">QR Code será gerado após salvar</p>
              <p className="text-xs text-fg-subtle">Pronto para impressão em etiqueta térmica industrial.</p>
            </div>
          </Card>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" loading={submitting}>
            {submitting ? "Salvando..." : "Salvar Ponto"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
