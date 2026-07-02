import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default async function NovaInspecaoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;

  return (
    <PlaceholderPage
      title={`Nova inspeção — Ponto ${codigo}`}
      description="Formulário de registro de inspeção (medições, condição visual, conformidade, observações)."
      nextStep={`Formulário em construção — depende de POST /api/inspection-points/${codigo}/inspections (próxima etapa do roadmap).`}
    />
  );
}
