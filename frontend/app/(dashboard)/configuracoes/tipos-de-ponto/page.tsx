"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPointType, deletePointType, listPointTypes, updatePointType } from "@/lib/api/pointTypes";
import { ApiError } from "@/lib/api/http";
import type { PointType } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pencil } from "lucide-react";

export default function TiposDePontoPage() {
  const [pointTypes, setPointTypes] = useState<PointType[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAcronym, setEditAcronym] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function loadPointTypes() {
    setLoading(true);
    try {
      const page = await listPointTypes(0, 100);
      setPointTypes(page.content);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar os tipos de ponto.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPointTypes();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createPointType({ name, acronym, description: description || undefined });
      setName("");
      setAcronym("");
      setDescription("");
      await loadPointTypes();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar o tipo de ponto.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(pointType: PointType) {
    setEditingId(pointType.id);
    setEditName(pointType.name);
    setEditAcronym(pointType.acronym);
    setEditDescription(pointType.description ?? "");
  }

  async function saveEdit(id: string) {
    setError(null);
    try {
      await updatePointType(id, { name: editName, acronym: editAcronym, description: editDescription || undefined });
      setEditingId(null);
      await loadPointTypes();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível atualizar o tipo de ponto.");
    }
  }

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setError(null);
    try {
      await deletePointType(id);
      setConfirmDeleteId(null);
      await loadPointTypes();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível excluir o tipo de ponto.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-fg">Tipos de Ponto</h1>
        <p className="text-sm text-fg-muted">
          Cadastro das siglas de tipo de ponto de inspeção (CI, DESC, HC, etc).
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                label="Nome"
                placeholder="Ex: Caixa de inspeção"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="sm:w-32">
              <Input
                label="Sigla"
                placeholder="Ex: CI"
                maxLength={10}
                required
                value={acronym}
                onChange={(e) => setAcronym(e.target.value.toUpperCase())}
              />
            </div>
          </div>
          <Input
            label="Descrição (opcional)"
            placeholder="Ex: Caixa de inspeção de aterramento no solo"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div>
            <Button type="submit" loading={submitting}>
              {submitting ? "Salvando..." : "Adicionar"}
            </Button>
          </div>
        </form>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </Card>

      <Card padding="none">
        {loading ? (
          <p className="p-4 text-sm text-fg-muted">Carregando...</p>
        ) : pointTypes.length === 0 ? (
          <p className="p-4 text-sm text-fg-muted">Nenhum tipo de ponto cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {pointTypes.map((pointType) => (
              <li key={pointType.id} className="p-4">
                {editingId === pointType.id ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                    </div>
                    <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={() => saveEdit(pointType.id)}>
                        Salvar
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-fg">
                        {pointType.name} <span className="text-fg-subtle">({pointType.acronym})</span>
                      </p>
                      {pointType.description && (
                        <p className="text-xs text-fg-muted">{pointType.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(pointType)}
                        className="text-fg-muted hover:text-fg"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {confirmDeleteId === pointType.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-fg-muted">Confirmar?</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(pointType.id)}
                          >
                            Excluir
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDelete(pointType.id)}
                          className="text-sm font-medium text-danger hover:underline"
                        >
                          Excluir
                        </button>
                      )}
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
