import { FichaDoPontoClient } from "@/components/pontos/FichaDoPontoClient";

export default async function FichaDoPontoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;

  return <FichaDoPontoClient codigo={codigo} />;
}
