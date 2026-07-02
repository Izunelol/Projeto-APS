"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listClients } from "@/lib/api/clients";
import { listInspectionPoints } from "@/lib/api/inspectionPoints";
import { ApiError } from "@/lib/api/http";
import type { Client, InspectionPoint, PointStatus } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CodeBadge } from "@/components/ui/CodeBadge";
import { Select } from "@/components/ui/Select";
import { Building2, ChevronDown, ChevronRight, Plus } from "lucide-react";

const STATUS_BADGE: Record<PointStatus, "success" | "neutral" | "danger"> = {
  ATIVO: "success",
  INATIVO: "neutral",
  DESATIVADO: "danger",
};

export default function PontosPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<PointStatus | "">("");

  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [pointsByClient, setPointsByClient] = useState<Record<string, InspectionPoint[]>>({});
  const [pointsLoading, setPointsLoading] = useState(false);

  useEffect(() => {
    setLoadingClients(true);
    listClients(0, 100)
      .then(async (page) => {
        setClients(page.content);
        const entries = await Promise.all(
          page.content.map(async (client) => {
            const result = await listInspectionPoints({ clientId: client.id, size: 1 });
            return [client.id, result.totalElements] as const;
          }),
        );
        setCounts(Object.fromEntries(entries));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar os clientes."))
      .finally(() => setLoadingClients(false));
  }, []);

  async function loadPointsForClient(clientId: string, statusOverride?: PointStatus | "") {
    const effectiveStatus = statusOverride !== undefined ? statusOverride : status;
    setPointsLoading(true);
    try {
      const result = await listInspectionPoints({ clientId, status: effectiveStatus || undefined, size: 100 });
      setPointsByClient((prev) => ({ ...prev, [clientId]: result.content }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar os pontos.");
    } finally {
      setPointsLoading(false);
    }
  }

  function toggleExpand(client: Client) {
    if (expandedClientId === client.id) {
      setExpandedClientId(null);
      return;
    }
    setExpandedClientId(client.id);
    if (!pointsByClient[client.id]) {
      loadPointsForClient(client.id);
    }
  }

  function handleStatusChange(value: PointStatus | "") {
    setStatus(value);
    setPointsByClient({});
    if (expandedClientId) {
      loadPointsForClient(expandedClientId, value);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Pontos de Inspeção</h1>
          <p className="text-sm text-fg-muted">
            Pontos agrupados por cliente. Clique em um cliente para ver os pontos cadastrados.
          </p>
        </div>
        <Link href="/pontos/novo">
          <Button type="button">
            <Plus className="h-4 w-4" />
            Novo Ponto
          </Button>
        </Link>
      </div>

      <Card padding="sm" className="max-w-xs">
        <Select
          label="Status"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as PointStatus | "")}
        >
          <option value="">Todos</option>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
          <option value="DESATIVADO">Desativado</option>
        </Select>
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Card padding="none">
        {loadingClients ? (
          <p className="p-4 text-sm text-fg-muted">Carregando...</p>
        ) : clients.length === 0 ? (
          <p className="p-4 text-sm text-fg-muted">Nenhum cliente cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {clients.map((client) => (
              <li key={client.id}>
                <button
                  type="button"
                  onClick={() => toggleExpand(client)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-surface-alt"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-alt text-accent">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-fg">
                        {client.name} <span className="text-fg-subtle">({client.acronym})</span>
                      </p>
                      <p className="text-xs text-fg-muted">{counts[client.id] ?? 0} ponto(s) cadastrado(s)</p>
                    </div>
                  </div>
                  {expandedClientId === client.id ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-fg-subtle" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-fg-subtle" />
                  )}
                </button>

                {expandedClientId === client.id && (
                  <div className="border-t border-border">
                    {pointsLoading ? (
                      <p className="p-4 text-sm text-fg-muted">Carregando pontos...</p>
                    ) : (pointsByClient[client.id] ?? []).length === 0 ? (
                      <p className="p-4 text-sm text-fg-muted">Nenhum ponto encontrado para este cliente.</p>
                    ) : (
                      <ul className="divide-y divide-border">
                        {(pointsByClient[client.id] ?? []).map((point) => (
                          <li key={point.id}>
                            <Link
                              href={`/pontos/${point.code}`}
                              className="flex items-center justify-between gap-3 py-3 pl-16 pr-4 hover:bg-surface-alt"
                            >
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <CodeBadge code={point.code} />
                                  <Badge variant={STATUS_BADGE[point.status]}>{point.status}</Badge>
                                </div>
                                <p className="text-xs text-fg-muted">
                                  {point.areaName} • {point.locationDescription || "Sem localização"}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 shrink-0 text-fg-subtle" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
