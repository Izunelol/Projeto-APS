import { Card } from "@/components/ui/Card";

export default function DashboardHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Painel</h1>
        <p className="text-sm text-zinc-600">
          Visão geral dos pontos de inspeção de SPDA e das inspeções registradas.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-zinc-500">Pontos cadastrados</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">—</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Inspeções realizadas</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">—</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Conformes</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">—</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Não conformes</p>
          <p className="mt-2 text-3xl font-semibold text-red-600">—</p>
        </Card>
      </div>
      <Card>
        <p className="text-sm text-zinc-600">
          Os indicadores serão calculados assim que os endpoints de dashboard
          (<code>/api/dashboard/*</code>) forem implementados na próxima etapa.
        </p>
      </Card>
    </div>
  );
}
