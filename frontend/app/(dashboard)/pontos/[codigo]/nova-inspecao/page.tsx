import { NovaInspecaoClient } from "@/components/pontos/NovaInspecaoClient";

export default async function NovaInspecaoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;

  return <NovaInspecaoClient codigo={codigo} />;
}
