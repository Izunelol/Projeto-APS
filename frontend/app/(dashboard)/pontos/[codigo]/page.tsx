import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default async function FichaDoPontoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;

  return (
    <PlaceholderPage
      title={`Ponto ${codigo}`}
      description="Ficha digital do ponto: dados cadastrais e histórico de inspeções."
      nextStep={`Tela em construção — depende de GET /api/inspection-points/${codigo} (próxima etapa do roadmap). Definir também se esta rota deve ser pública para leitura via QR Code.`}
    />
  );
}
