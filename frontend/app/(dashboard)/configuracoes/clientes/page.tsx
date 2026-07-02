"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient, deleteClient, listClients } from "@/lib/api/clients";
import { ApiError } from "@/lib/api/http";
import type { Client } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deleteClient(id);
      await loadClients();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível excluir o cliente.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Clientes</h1>
        <p className="text-sm text-zinc-600">
          Cadastre as empresas/instalações que utilizarão o sistema de rastreabilidade.
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
          <Button type="submit" disabled={submitting}>
            {submitting ? "Salvando..." : "Adicionar"}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </Card>

      <Card>
        {loading ? (
          <p className="text-sm text-zinc-500">Carregando...</p>
        ) : clients.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum cliente cadastrado ainda.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-2 font-medium">Nome</th>
                <th className="py-2 font-medium">Sigla</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-zinc-100 last:border-0">
                  <td className="py-2 text-zinc-900">{client.name}</td>
                  <td className="py-2 text-zinc-600">{client.acronym}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
