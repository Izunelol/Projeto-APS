"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Espelham os tokens de cor de app/globals.css (tema único, sem modo claro).
const COLOR_CONFORMING = "#22c55e";
const COLOR_NON_CONFORMING = "#ef4444";
const COLOR_GRID = "#262e2a";
const COLOR_TEXT_MUTED = "#97a39c";
const COLOR_SURFACE_ALT = "#1b211e";
const COLOR_BORDER = "#262e2a";

export interface ConformityDatum {
  id: string;
  label: string;
  totalPoints: number;
  conformingCount: number;
  nonConformingCount: number;
  conformingPercentage: number;
}

export function ConformityBarChart({ data }: { data: ConformityDatum[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-fg-muted">Sem dados suficientes para exibir o gráfico.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid vertical={false} stroke={COLOR_GRID} strokeWidth={1} />
          <XAxis
            dataKey="label"
            tick={{ fill: COLOR_TEXT_MUTED, fontSize: 12 }}
            axisLine={{ stroke: COLOR_GRID }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: COLOR_TEXT_MUTED, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: COLOR_SURFACE_ALT,
              border: `1px solid ${COLOR_BORDER}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#edf2ef" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: COLOR_TEXT_MUTED }}
            formatter={(value) => (value === "conformingCount" ? "Conforme" : "Não Conforme")}
          />
          <Bar
            dataKey="conformingCount"
            name="conformingCount"
            stackId="conformity"
            fill={COLOR_CONFORMING}
            stroke={COLOR_SURFACE_ALT}
            strokeWidth={2}
            maxBarSize={24}
          />
          <Bar
            dataKey="nonConformingCount"
            name="nonConformingCount"
            stackId="conformity"
            fill={COLOR_NON_CONFORMING}
            stroke={COLOR_SURFACE_ALT}
            strokeWidth={2}
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-fg-subtle">
              <th className="pb-2 font-medium">Nome</th>
              <th className="pb-2 font-medium">Pontos</th>
              <th className="pb-2 font-medium">Conformes</th>
              <th className="pb-2 font-medium">Não Conformes</th>
              <th className="pb-2 font-medium">% Conforme</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr key={row.id} className="text-fg">
                <td className="py-1.5 pr-2">{row.label}</td>
                <td className="py-1.5 pr-2">{row.totalPoints}</td>
                <td className="py-1.5 pr-2">{row.conformingCount}</td>
                <td className="py-1.5 pr-2">{row.nonConformingCount}</td>
                <td className="py-1.5 pr-2">{Math.round(row.conformingPercentage)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
