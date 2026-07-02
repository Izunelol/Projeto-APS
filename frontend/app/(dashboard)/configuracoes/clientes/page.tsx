"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient, deleteClient, listClients, updateClient } from "@/lib/api/clients";
import { createUnit, deleteUnit, listUnitsByClient } from "@/lib/api/units";
import { createArea, deleteArea, listAreasByUnit, updateArea } from "@/lib/api/areas";
import { ApiError } from "@/lib/api/http";
import type { Area, Client, Unit } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ChevronDown, ChevronRight, Pencil } from "lucide-react";

type AreaWithUnit = Area & { unitName: string };

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAcronym, setEditAcronym] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Unidades
  const [unitsByClient, setUnitsByClient] = useState<Record<string, Unit[]>>({});
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [unitAcronym, setUnitAcronym] = useState("");
  const [unitError, setUnitError] = useState<string | null>(null);

  // Áreas (agrupadas por cliente, mas cada área pertence a uma unidade específica)
  const [areasByClient, setAreasByClient] = useState<Record<string, AreaWithUnit[]>>({});
  const [areasLoading, setAreasLoading] = useState(false);
  const [areaUnitId, setAreaUnitId] = useState("");
  const [areaName, setAreaName] = useState("");
  const [areaAcronym, setAreaAcronym] = useState("");
  const [areaError, setAreaError] = useState<string | null>(null);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [editAreaName, setEditAreaName] = useState("");
  const [editAreaAcronym, setEditAreaAcronym] = useState("");
  const [confirmDeleteAreaId, setConfirmDeleteAreaId] = useState<string | null>(null);

  async function loadClients() {
    setLoading(true);
    try {
      const page = await listClients();
      setClients(page.content);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createClient({ name, acronym });
      setName("");
      setAcronym("");
      await loadClients();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar o cliente.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(client: Client) {
    setEditingId(client.id);
    setEditName(client.name);
    setEditAcronym(client.acronym);
  }

  async function saveEdit(id: string) {
    setError(null);
    try {
      await updateClient(id, { name: editName, acronym: editAcronym });
      setEditingId(null);
      await loadClients();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível atualizar o cliente.");
    }
  }

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setError(null);
    try {
      await deleteClient(id);
      setConfirmDeleteId(null);
      await loadClients();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível excluir o cliente.");
    }
  }

  async function loadAreasForClient(clientId: string, units: Unit[]) {
    setAreasLoading(true);
    try {
      const perUnit = await Promise.all(
        units.map(async (unit) => {
          const areas = await listAreasByUnit(unit.id);
          return areas.map((area) => ({ ...area, unitName: unit.name }));
        }),
      );
      setAreasByClient((prev) => ({ ...prev, [clientId]: perUnit.flat() }));
    } catch (err) {
      setAreaError(err instanceof ApiError ? err.message : "Não foi possível carregar as áreas.");
    } finally {
      setAreasLoading(false);
    }
  }

  async function toggleExpand(client: Client) {
    if (expandedId === client.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(client.id);
    setUnitError(null);
    setAreaError(null);

    let units = unitsByClient[client.id];
    if (!units) {
      setUnitsLoading(true);
      try {
        units = await listUnitsByClient(client.id);
        setUnitsByClient((prev) => ({ ...prev, [client.id]: units! }));
      } catch (err) {
        setUnitError(err instanceof ApiError ? err.message : "Não foi possível carregar as unidades.");
        setUnitsLoading(false);
        return;
      }
      setUnitsLoading(false);
    }
    setAreaUnitId(units[0]?.id ?? "");

    if (!areasByClient[client.id]) {
      await loadAreasForClient(client.id, units);
    }
  }

  async function handleAddUnit(event: FormEvent, clientId: string) {
    event.preventDefault();
    setUnitError(null);
    try {
      await createUnit(clientId, { name: unitName, acronym: unitAcronym });
      setUnitName("");
      setUnitAcronym("");
      const units = await listUnitsByClient(clientId);
      setUnitsByClient((prev) => ({ ...prev, [clientId]: units }));
      if (!areaUnitId) setAreaUnitId(units[0]?.id ?? "");
    } catch (err) {
      setUnitError(err instanceof ApiError ? err.message : "Não foi possível criar a unidade.");
    }
  }

  async function handleDeleteUnit(clientId: string, unitId: string) {
    setUnitError(null);
    try {
      await deleteUnit(unitId);
      const units = await listUnitsByClient(clientId);
      setUnitsByClient((prev) => ({ ...prev, [clientId]: units }));
      await loadAreasForClient(clientId, units);
      if (areaUnitId === unitId) setAreaUnitId(units[0]?.id ?? "");
    } catch (err) {
      setUnitError(err instanceof ApiError ? err.message : "Não foi possível excluir a unidade.");
    }
  }

  async function handleAddArea(event: FormEvent, clientId: string) {
    event.preventDefault();
    setAreaError(null);
    if (!areaUnitId) {
      setAreaError("Cadastre uma unidade antes de adicionar áreas.");
      return;
    }
    try {
      await createArea(areaUnitId, { name: areaName, acronym: areaAcronym });
      setAreaName("");
      setAreaAcronym("");
      await loadAreasForClient(clientId, unitsByClient[clientId] ?? []);
    } catch (err) {
      setAreaError(err instanceof ApiError ? err.message : "Não foi possível criar a área.");
    }
  }

  function startEditArea(area: AreaWithUnit) {
    setEditingAreaId(area.id);
    setEditAreaName(area.name);
    setEditAreaAcronym(area.acronym);
  }

  async function saveEditArea(clientId: string, id: string) {
    setAreaError(null);
    try {
      await updateArea(id, { name: editAreaName, acronym: editAreaAcronym });
      setEditingAreaId(null);
      await loadAreasForClient(clientId, unitsByClient[clientId] ?? []);
    } catch (err) {
      setAreaError(err instanceof ApiError ? err.message : "Não foi possível atualizar a área.");
    }
  }

  async function handleDeleteArea(clientId: string, id: string) {
    if (confirmDeleteAreaId !== id) {
      setConfirmDeleteAreaId(id);
      return;
    }
    setAreaError(null);
    try {
      await deleteArea(id);
      setConfirmDeleteAreaId(null);
      await loadAreasForClient(clientId, unitsByClient[clientId] ?? []);
    } catch (err) {
      setAreaError(err instanceof ApiError ? err.message : "Não foi possível excluir a área.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-fg">Clientes</h1>
        <p className="text-sm text-fg-muted">
          Cadastre clientes e, para cada um, suas unidades e áreas. Alterar a sigla de um cliente ou
          área atualiza automaticamente os códigos dos pontos de inspeção já cadastrados.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              id="name"
              label="Nome"
              placeholder="Ex: Raízen"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="sm:w-40">
            <Input
              id="acronym"
              label="Sigla"
              placeholder="Ex: RZ"
              maxLength={10}
              required
              value={acronym}
              onChange={(e) => setAcronym(e.target.value.toUpperCase())}
            />
          </div>
          <Button type="submit" loading={submitting}>
            {submitting ? "Salvando..." : "Adicionar"}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </Card>

      <Card padding="none">
        {loading ? (
          <p className="p-4 text-sm text-fg-muted">Carregando...</p>
        ) : clients.length === 0 ? (
          <p className="p-4 text-sm text-fg-muted">Nenhum cliente cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {clients.map((client) => (
              <li key={client.id} className="p-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleExpand(client)}
                    className="text-fg-muted hover:text-fg"
                    aria-label="Expandir unidades e áreas"
                  >
                    {expandedId === client.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {editingId === client.id ? (
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="sm:flex-1">
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                      </div>
                      <div className="sm:w-28">
                        <Input
                          value={editAcronym}
                          maxLength={10}
                          onChange={(e) => setEditAcronym(e.target.value.toUpperCase())}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={() => saveEdit(client.id)}>
                          Salvar
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-fg">{client.name}</p>
                        <p className="text-xs text-fg-muted">{client.acronym}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(client)}
                          className="text-fg-muted hover:text-fg"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {confirmDeleteId === client.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-fg-muted">Confirmar?</span>
                            <Button type="button" size="sm" variant="danger" onClick={() => handleDelete(client.id)}>
                              Excluir
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDelete(client.id)}
                            className="text-sm font-medium text-danger hover:underline"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {expandedId === client.id && (
                  <div className="ml-7 mt-3 flex flex-col gap-6 border-l border-border pl-4">
                    {/* Unidades */}
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Unidades</p>
                      {unitsLoading ? (
                        <p className="text-sm text-fg-muted">Carregando unidades...</p>
                      ) : (
                        <ul className="flex flex-col gap-1">
                          {(unitsByClient[client.id] ?? []).map((unit) => (
                            <li key={unit.id} className="flex items-center justify-between text-sm">
                              <span className="text-fg">
                                {unit.name} <span className="text-fg-subtle">({unit.acronym})</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteUnit(client.id, unit.id)}
                                className="text-xs text-danger hover:underline"
                              >
                                Excluir
                              </button>
                            </li>
                          ))}
                          {(unitsByClient[client.id] ?? []).length === 0 && (
                            <p className="text-sm text-fg-subtle">Nenhuma unidade cadastrada.</p>
                          )}
                        </ul>
                      )}
                      <form
                        onSubmit={(e) => handleAddUnit(e, client.id)}
                        className="flex flex-col gap-2 sm:flex-row sm:items-end"
                      >
                        <div className="sm:flex-1">
                          <Input
                            placeholder="Nome da unidade"
                            required
                            value={unitName}
                            onChange={(e) => setUnitName(e.target.value)}
                          />
                        </div>
                        <div className="sm:w-28">
                          <Input
                            placeholder="Sigla"
                            required
                            maxLength={10}
                            value={unitAcronym}
                            onChange={(e) => setUnitAcronym(e.target.value.toUpperCase())}
                          />
                        </div>
                        <Button type="submit" size="sm" variant="outline">
                          Adicionar unidade
                        </Button>
                      </form>
                      {unitError && <p className="text-xs text-danger">{unitError}</p>}
                    </div>

                    {/* Áreas */}
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Áreas</p>
                      {areasLoading ? (
                        <p className="text-sm text-fg-muted">Carregando áreas...</p>
                      ) : (
                        <ul className="flex flex-col gap-2">
                          {(areasByClient[client.id] ?? []).map((area) => (
                            <li key={area.id}>
                              {editingAreaId === area.id ? (
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                  <div className="sm:flex-1">
                                    <Input
                                      value={editAreaName}
                                      onChange={(e) => setEditAreaName(e.target.value)}
                                    />
                                  </div>
                                  <div className="sm:w-24">
                                    <Input
                                      value={editAreaAcronym}
                                      maxLength={10}
                                      onChange={(e) => setEditAreaAcronym(e.target.value.toUpperCase())}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button type="button" size="sm" onClick={() => saveEditArea(client.id, area.id)}>
                                      Salvar
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingAreaId(null)}
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-fg">
                                    {area.name} <span className="text-fg-subtle">({area.acronym})</span>{" "}
                                    <span className="text-fg-subtle">— {area.unitName}</span>
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => startEditArea(area)}
                                      className="text-fg-muted hover:text-fg"
                                      aria-label="Editar área"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    {confirmDeleteAreaId === area.id ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-fg-muted">Confirmar?</span>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="danger"
                                          onClick={() => handleDeleteArea(client.id, area.id)}
                                        >
                                          Excluir
                                        </Button>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setConfirmDeleteAreaId(null)}
                                        >
                                          Cancelar
                                        </Button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteArea(client.id, area.id)}
                                        className="text-xs text-danger hover:underline"
                                      >
                                        Excluir
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                          {(areasByClient[client.id] ?? []).length === 0 && (
                            <p className="text-sm text-fg-subtle">Nenhuma área cadastrada.</p>
                          )}
                        </ul>
                      )}

                      {(unitsByClient[client.id] ?? []).length === 0 ? (
                        <p className="text-xs text-fg-subtle">Cadastre uma unidade antes de adicionar áreas.</p>
                      ) : (
                        <form
                          onSubmit={(e) => handleAddArea(e, client.id)}
                          className="flex flex-col gap-2 sm:flex-row sm:items-end"
                        >
                          <div className="sm:w-40">
                            <Select value={areaUnitId} onChange={(e) => setAreaUnitId(e.target.value)}>
                              {(unitsByClient[client.id] ?? []).map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                  {unit.name}
                                </option>
                              ))}
                            </Select>
                          </div>
                          <div className="sm:flex-1">
                            <Input
                              placeholder="Nome da área"
                              required
                              value={areaName}
                              onChange={(e) => setAreaName(e.target.value)}
                            />
                          </div>
                          <div className="sm:w-24">
                            <Input
                              placeholder="Sigla"
                              required
                              maxLength={10}
                              value={areaAcronym}
                              onChange={(e) => setAreaAcronym(e.target.value.toUpperCase())}
                            />
                          </div>
                          <Button type="submit" size="sm" variant="outline">
                            Adicionar área
                          </Button>
                        </form>
                      )}
                      {areaError && <p className="text-xs text-danger">{areaError}</p>}
                    </div>
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
